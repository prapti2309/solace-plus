from fastapi import HTTPException, status, Depends
from app.routers.auth import get_current_user
from app.models.models import User
from typing import List

class RoleChecker:
    """
    Role-Based Access Control (RBAC) dependency helper.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user.role}' does not have sufficient permissions. Required roles: {self.allowed_roles}"
            )
        return user

# Pre-configured role dependencies
require_user = RoleChecker(["user", "support_admin", "system_admin"])
require_support_admin = RoleChecker(["support_admin", "system_admin"])
require_system_admin = RoleChecker(["system_admin"])
