"""
Authentication endpoints.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import traceback
import pyotp
import qrcode
import io
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_current_active_user,
    get_password_hash,
    verify_token
)
from app.core.config import settings
from app.core.security import validate_email, validate_username, validate_password_strength
from app.crud_utils import create_user, get_user_by_email, get_user_by_username
from app.schemas import (
    Token,
    UserResponse,
    MessageResponse,
    UserCreate
)
from app.db_models import TwoFactorSecret

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Validate email
    if not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    # Validate username
    if not validate_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens"
        )
    # Validate password strength
    is_valid, error_message = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    # Create user
    user = create_user(db, user_data)
    return UserResponse.from_orm(user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token. Если включён 2FA — требуется подтверждение."""
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        db.refresh(user)
        if not bool(user.is_active):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        # Проверка 2FA
        tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == user.id, TwoFactorSecret.is_enabled == True).first()
        if tfa:
            return {"need_2fa": True, "user_id": user.id}
        if getattr(user, "updated_at", None) is None:
            from datetime import datetime
            setattr(user, "updated_at", datetime.utcnow())
            db.commit()
            db.refresh(user)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user.email})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.from_orm(user)
        }
    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{tb}")


@router.post("/login/2fa", response_model=Token)
def login_2fa(user_id: int, code: str, db: Session = Depends(get_db)):
    """Завершить логин с 2FA-кодом."""
    from app.db_models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == user.id, TwoFactorSecret.is_enabled == True).first()
    if not tfa or not tfa.secret:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    import pyotp
    totp = pyotp.TOTP(tfa.secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.from_orm(user)
    }


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    token_data = verify_token(refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    if not token_data.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    user = get_user_by_email(db, token_data.username)
    if not user or not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.from_orm(user)
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user=Depends(get_current_active_user)):
    """Get current user information."""
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout():
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    current_password: str,
    new_password: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    from app.auth import verify_password
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    # Validate new password strength
    is_valid, error_message = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/2fa/setup")
def setup_2fa(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Сгенерировать секрет и QR для 2FA (TOTP)."""
    # Генерируем секрет
    secret = pyotp.random_base32()
    # Сохраняем или обновляем секрет в БД
    tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == current_user.id).first()
    if not tfa:
        tfa = TwoFactorSecret(user_id=current_user.id, secret=secret, is_enabled=False, method="totp")
        db.add(tfa)
    else:
        tfa.secret = secret
        tfa.is_enabled = False
    db.commit()
    # Генерируем QR
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=current_user.email, issuer_name="Freelance Platform")
    img = qrcode.make(otp_uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@router.post("/2fa/enable")
def enable_2fa(code: str, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Включить 2FA после подтверждения кода из приложения."""
    tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == current_user.id).first()
    if not tfa or not tfa.secret:
        raise HTTPException(status_code=400, detail="2FA secret not set")
    totp = pyotp.TOTP(tfa.secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
    tfa.is_enabled = True
    from datetime import datetime
    tfa.confirmed_at = datetime.utcnow()
    db.commit()
    return {"message": "2FA enabled"}


@router.post("/2fa/verify")
def verify_2fa(code: str, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Проверить 2FA-код (например, при логине)."""
    tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == current_user.id, TwoFactorSecret.is_enabled == True).first()
    if not tfa or not tfa.secret:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    totp = pyotp.TOTP(tfa.secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
    return {"message": "2FA verified"}


@router.post("/2fa/disable")
def disable_2fa(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Отключить 2FA для пользователя."""
    tfa = db.query(TwoFactorSecret).filter(TwoFactorSecret.user_id == current_user.id).first()
    if not tfa:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    tfa.is_enabled = False
    db.commit()
    return {"message": "2FA disabled"}
