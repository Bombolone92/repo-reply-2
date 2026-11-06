"""Thin shim to re-export stable onboarding endpoints.

This file has historically been modified by external scripts. To prevent
accidental truncation, the real implementations now live in
`backend/api/onboarding_endpoints.py`. Importers that rely on
`backend.api.onboarding` will continue to work.
"""

from .onboarding_endpoints import *  # noqa: F401,F403

__all__ = [name for name in globals().keys() if not name.startswith('_')]
