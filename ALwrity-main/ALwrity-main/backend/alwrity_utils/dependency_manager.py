"""
Dependency Management Module
Handles installation and verification of Python dependencies.
"""

import sys
import subprocess
from pathlib import Path
from typing import List, Tuple


class DependencyManager:
    """Manages Python package dependencies for ALwrity backend."""
    
    def __init__(self, requirements_file: str = "requirements.txt"):
        self.requirements_file = Path(requirements_file)
        self.critical_packages = [
            'fastapi',
            'uvicorn',
            'pydantic',
            'sqlalchemy',
            'loguru'
        ]
        
        self.optional_packages = [
            'openai',
            'google.generativeai',
            'anthropic',
            'mistralai',
            'spacy',
            'nltk'
        ]
    
    def install_requirements(self) -> bool:
        """Install packages from requirements.txt."""
        print("📦 Installing required packages...")
        
        if not self.requirements_file.exists():
            print(f"❌ Requirements file not found: {self.requirements_file}")
            return False
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", str(self.requirements_file)
            ])
            print("✅ All packages installed successfully!")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing packages: {e}")
            return False
    
    def check_critical_dependencies(self) -> Tuple[bool, List[str]]:
        """Check if critical dependencies are available."""
        import os
        verbose = os.getenv("ALWRITY_VERBOSE", "false").lower() == "true"
        
        if verbose:
            print("🔍 Checking critical dependencies...")
        
        missing_packages = []
        
        for package in self.critical_packages:
            try:
                __import__(package.replace('-', '_'))
                if verbose:
                    print(f"   ✅ {package}")
            except ImportError:
                if verbose:
                    print(f"   ❌ {package} - MISSING")
                missing_packages.append(package)
        
        if missing_packages:
            if verbose:
                print(f"❌ Missing critical packages: {', '.join(missing_packages)}")
            return False, missing_packages
        
        if verbose:
            print("✅ All critical dependencies available!")
        return True, []
    
    def check_optional_dependencies(self) -> Tuple[bool, List[str]]:
        """Check if optional dependencies are available."""
        import os
        verbose = os.getenv("ALWRITY_VERBOSE", "false").lower() == "true"
        
        if verbose:
            print("🔍 Checking optional dependencies...")
        
        missing_packages = []
        
        for package in self.optional_packages:
            try:
                __import__(package.replace('-', '_'))
                if verbose:
                    print(f"   ✅ {package}")
            except ImportError:
                if verbose:
                    print(f"   ⚠️  {package} - MISSING (optional)")
                missing_packages.append(package)
        
        if missing_packages and verbose:
            print(f"⚠️  Missing optional packages: {', '.join(missing_packages)}")
            print("   Some features may not be available")
        
        return len(missing_packages) == 0, missing_packages
    
    def setup_spacy_model(self) -> bool:
        """Set up spaCy English model."""
        print("🧠 Setting up spaCy model...")
        
        try:
            import spacy
            
            model_name = "en_core_web_sm"
            
            try:
                # Try to load the model
                nlp = spacy.load(model_name)
                test_doc = nlp("This is a test sentence.")
                if test_doc and len(test_doc) > 0:
                    print(f"✅ spaCy model '{model_name}' is available")
                    return True
            except OSError:
                # Model not found - try to download it
                print(f"⚠️  spaCy model '{model_name}' not found, downloading...")
                try:
                    subprocess.check_call([
                        sys.executable, "-m", "spacy", "download", model_name
                    ])
                    print(f"✅ spaCy model '{model_name}' downloaded successfully")
                    return True
                except subprocess.CalledProcessError as e:
                    print(f"❌ Failed to download spaCy model: {e}")
                    print("   Please download manually with: python -m spacy download en_core_web_sm")
                    return False
                
        except ImportError:
            print("⚠️  spaCy not installed - skipping model setup")
            return True  # Don't fail for missing spaCy package
        
        return True
    
    def setup_nltk_data(self) -> bool:
        """Set up NLTK data."""
        print("📚 Setting up NLTK data...")
        
        try:
            import nltk
            
            # Essential NLTK data packages
            essential_data = [
                ('punkt_tab', 'tokenizers/punkt_tab'),  # Updated tokenizer
                ('stopwords', 'corpora/stopwords'),
                ('averaged_perceptron_tagger', 'taggers/averaged_perceptron_tagger')
            ]
            
            for data_package, path in essential_data:
                try:
                    nltk.data.find(path)
                    print(f"   ✅ {data_package}")
                except LookupError:
                    print(f"   ⚠️  {data_package} - downloading...")
                    try:
                        nltk.download(data_package, quiet=True)
                        print(f"   ✅ {data_package} downloaded")
                    except Exception as e:
                        print(f"   ⚠️  {data_package} download failed: {e}")
                        # Try fallback for punkt_tab -> punkt
                        if data_package == 'punkt_tab':
                            try:
                                nltk.download('punkt', quiet=True)
                                print(f"   ✅ punkt (fallback) downloaded")
                            except:
                                pass
            
            print("✅ NLTK data setup complete")
            return True
            
        except ImportError:
            print("⚠️  NLTK not installed - skipping data setup")
            return True  # Don't fail for missing NLTK package
        
        return True
