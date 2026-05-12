"""
Mirror - 认知数据提取引擎
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import distillations
from app.routers import distillation_control

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="认知数据提取引擎 - 基于AI的智能数据提取与分析平台",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境需要配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(distillations.router, prefix="/api", tags=["distillations"])
app.include_router(distillation_control.router, prefix="/api", tags=["distillation-control"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Welcome to Mirror - 认知数据提取引擎",
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "not_configured",  # 后续会添加数据库连接检查
        "apis": {
            "anthropic": "configured" if settings.ANTHROPIC_API_KEY else "not_configured",
            "google": "configured" if settings.GOOGLE_API_KEY else "not_configured"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
