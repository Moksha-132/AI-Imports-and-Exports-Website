from main import app
from fastapi.routing import APIRoute

print("Registered API Routes:")
for route in app.routes:
    if isinstance(route, APIRoute):
        methods = ",".join(route.methods)
        print(f"{methods:<10} {route.path}")