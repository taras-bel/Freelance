from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from uuid import uuid4
from app.database import get_db
from app.auth import get_current_active_user
from app.db_models import User, KYCRequest, KYCStatus
from app.schemas import KYCRequest as KYCRequestSchema, KYCRequestCreate, KYCStatus as KYCStatusSchema
from app.services.ai_service import ai_service
import asyncio

router = APIRouter()

KYC_UPLOAD_DIR = "uploads/kyc_docs"
os.makedirs(KYC_UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=KYCRequestSchema)
def upload_kyc_document(
    document_type: str,
    file: UploadFile = File(...),
    comment: str = "",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a KYC document for verification."""
    ext = file.filename.split(".")[-1].lower()
    allowed = {"pdf", "jpg", "jpeg", "png"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed")
    contents = file.file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")
    unique_name = f"{uuid4().hex}_{file.filename}"
    file_path = os.path.join(KYC_UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)
    document_url = f"/api/v1/kyc/files/{unique_name}"
    # AI review
    ai_result = None
    try:
        ai_result = asyncio.run(ai_service.review_kyc_document(
            document_type=document_type,
            comment=comment,
            document_url=document_url,
            user_info={"id": current_user.id, "email": current_user.email}
        ))
    except Exception as e:
        ai_result = None
    if ai_result and ai_result.get("status") in ("APPROVED", "REJECTED"):
        status_val = KYCStatus[ai_result["status"].upper()]
        ai_reason = ai_result.get("reason", "")
    else:
        status_val = KYCStatus.PENDING
        ai_reason = "AI недоступен или не дал ответа"
    kyc = KYCRequest(
        user_id=current_user.id,
        status=status_val.value,
        document_type=document_type,
        document_url=document_url,
        comment=comment + (f"\n[AI]: {ai_reason}" if ai_reason else "")
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return KYCRequestSchema.from_orm(kyc)

@router.get("/status", response_model=List[KYCRequestSchema])
def get_kyc_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all KYC requests for the current user."""
    kyc_requests = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).all()
    return [KYCRequestSchema.from_orm(req) for req in kyc_requests]

from fastapi.responses import FileResponse
@router.get("/files/{file_name}")
def download_kyc_file(
    file_name: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    kyc = db.query(KYCRequest).filter(KYCRequest.document_url == f"/api/v1/kyc/files/{file_name}").first()
    if not kyc:
        raise HTTPException(status_code=404, detail="File not found")
    if kyc.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    file_path = os.path.join(KYC_UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(file_path, filename=os.path.basename(file_path))

# Admin endpoints
@router.get("/admin/requests", response_model=List[KYCRequestSchema])
def list_kyc_requests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    kyc_requests = db.query(KYCRequest).all()
    return [KYCRequestSchema.from_orm(req) for req in kyc_requests]

@router.post("/admin/review/{kyc_id}", response_model=KYCRequestSchema)
def review_kyc_request(
    kyc_id: int,
    status: KYCStatusSchema,
    comment: str = "",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    kyc = db.query(KYCRequest).filter(KYCRequest.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC request not found")
    kyc.status = status
    kyc.comment = comment
    kyc.reviewed_at = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
    kyc.reviewed_by = current_user.id
    db.commit()
    db.refresh(kyc)
    return KYCRequestSchema.from_orm(kyc) 