from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import PaymentMethod
from app.schemas import PaymentMethodCreate, PaymentMethodUpdate


def create_payment_method(db: Session, method: PaymentMethodCreate, user_id: int) -> PaymentMethod:
    if getattr(method, 'is_default', False):
        _unset_other_defaults(db, user_id)
    db_method = PaymentMethod(user_id=user_id, **method.dict())
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method


def get_payment_method(db: Session, method_id: int) -> Optional[PaymentMethod]:
    return db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()


def get_payment_methods(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    method_type: Optional[str] = None,
    is_default: Optional[bool] = None
) -> List[PaymentMethod]:
    query = db.query(PaymentMethod)
    if user_id is not None:
        query = query.filter(PaymentMethod.user_id == user_id)
    if method_type is not None:
        query = query.filter(PaymentMethod.method_type == method_type)
    if is_default is not None:
        query = query.filter(PaymentMethod.is_default == is_default)
    return query.order_by(PaymentMethod.created_at.desc()).offset(skip).limit(limit).all()


def update_payment_method(db: Session, method_id: int, method_update: PaymentMethodUpdate) -> Optional[PaymentMethod]:
    db_method = get_payment_method(db, method_id)
    if not db_method:
        return None
    update_data = method_update.dict(exclude_unset=True)
    if update_data.get('is_default'):
        user_id = getattr(db_method, 'user_id', None)
        if isinstance(user_id, int):
            _unset_other_defaults(db, user_id)
    for field, value in update_data.items():
        setattr(db_method, field, value)
    db.commit()
    db.refresh(db_method)
    return db_method


def delete_payment_method(db: Session, method_id: int) -> bool:
    db_method = get_payment_method(db, method_id)
    if not db_method:
        return False
    db.delete(db_method)
    db.commit()
    return True


def set_default_payment_method(db: Session, method_id: int) -> bool:
    db_method = get_payment_method(db, method_id)
    if not db_method:
        return False
    user_id = getattr(db_method, 'user_id', None)
    if isinstance(user_id, int):
        _unset_other_defaults(db, user_id)
    setattr(db_method, 'is_default', True)
    db.commit()
    db.refresh(db_method)
    return True


def _unset_other_defaults(db: Session, user_id: int):
    methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).all()
    for method in methods:
        setattr(method, 'is_default', False)
        db.add(method)
    db.commit()
