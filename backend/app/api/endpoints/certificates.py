"""
Certificate management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_certificate,
    get_certificate,
    get_certificates,
    update_certificate,
    delete_certificate
)
from app.schemas import (
    CertificateCreate,
    Certificate,
    CertificateUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import Certificate as DBCertificate

router = APIRouter()


@router.post("/", response_model=Certificate)
def create_new_certificate(
    certificate_data: CertificateCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new certificate."""
    # Create certificate
    certificate = create_certificate(db, certificate_data, current_user.id)
    return certificate


@router.get("/", response_model=PaginatedResponse)
def get_all_certificates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get certificates with filters and pagination."""
    certificates = get_certificates(
        db, skip=skip, limit=limit, user_id=user_id, category=category
    )
    
    # Get total count
    total_query = db.query(DBCertificate)
    if user_id:
        total_query = total_query.filter(DBCertificate.user_id == user_id)
    if category:
        total_query = total_query.filter(DBCertificate.category == category)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=certificates,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{certificate_id}", response_model=Certificate)
def get_certificate_by_id(
    certificate_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get certificate by ID."""
    certificate = get_certificate(db, certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    return certificate


@router.put("/{certificate_id}", response_model=Certificate)
def update_certificate_details(
    certificate_id: int,
    certificate_data: CertificateUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update certificate details."""
    certificate = get_certificate(db, certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Check if user is authorized to update this certificate
    if certificate.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this certificate"
        )
    
    # Update certificate
    updated_certificate = update_certificate(
        db, certificate_id, certificate_data.dict(exclude_unset=True)
    )
    if not updated_certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    return updated_certificate


@router.delete("/{certificate_id}", response_model=MessageResponse)
def delete_certificate_by_id(
    certificate_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete certificate."""
    certificate = get_certificate(db, certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Check if user is authorized to delete this certificate
    if certificate.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this certificate"
        )
    
    success = delete_certificate(db, certificate_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    return {"message": "Certificate deleted successfully"}


@router.get("/me/certificates", response_model=List[Certificate])
def get_my_certificates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get certificates for current user."""
    certificates = get_certificates(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return certificates


@router.get("/user/{user_id}", response_model=List[Certificate])
def get_user_certificates(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get certificates for a specific user."""
    certificates = get_certificates(
        db, skip=skip, limit=limit, user_id=user_id
    )
    return certificates


@router.get("/categories", response_model=List[str])
def get_certificate_categories(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all certificate categories."""
    certificates = get_certificates(db)
    categories = list(set(certificate.category for certificate in certificates if certificate.category is not None))
    return categories


@router.get("/ping")
def ping():
    return {"message": "pong"}
