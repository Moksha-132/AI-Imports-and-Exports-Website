from pydantic import BaseModel, EmailStr
from typing import Optional

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
class UserLogin(BaseModel):
    email: EmailStr
    password: str
class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    company: Optional[str] = None
class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str

class HSNRequest(BaseModel):
    description: str

class DutyRequest(BaseModel):
    hsn_code: str
    origin: str
    destination: str
    value: float