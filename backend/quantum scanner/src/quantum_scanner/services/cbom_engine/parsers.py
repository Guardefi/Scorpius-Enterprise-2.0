"""Cryptographic parsers for different asset types."""

import re
import ast
from typing import List, Dict, Any
from pathlib import Path

from ...core.logging import get_logger
from .models import CryptoComponent, CryptoAlgorithmType

logger = get_logger(__name__)


class SourceCodeCryptoParser:
    """Parser for discovering cryptographic components in source code."""
    
    def __init__(self):
        """Initialize the source code parser."""
        self.crypto_patterns = {
            # Common crypto library imports
            'imports': [
                r'import\s+(cryptography|pycryptodome|hashlib|ssl|hmac)',
                r'from\s+(cryptography|pycryptodome|Crypto)\s+import',
                r'import\s+OpenSSL',
                r'from\s+Crypto\.(Cipher|Hash|Signature|PublicKey)\s+import',
            ],
            # Algorithm usage patterns
            'algorithms': [
                r'(AES|RSA|DES|3DES|Blowfish|ChaCha20)[\(\.\s]',
                r'(SHA1|SHA256|SHA512|MD5|BLAKE2)[\(\.\s]',
                r'(ECDSA|DSA|EdDSA|ECDH)[\(\.\s]',
                r'(Kyber|Dilithium|SPHINCS|Falcon)[\(\.\s]',
            ],
            # Key generation patterns
            'key_generation': [
                r'generate_private_key\(',
                r'RSA\.generate\(',
                r'ECC\.generate\(',
                r'.*\.generate_key\(',
            ],
        }
    
    async def parse(self, file_path: str) -> List[CryptoComponent]:
        """Parse source code file for cryptographic components."""
        components = []
        
        try:
            path = Path(file_path)
            if not path.exists():
                logger.warning("Source file not found", file_path=file_path)
                return components
            
            content = path.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
            
            # Parse based on file extension
            if path.suffix == '.py':
                components.extend(await self._parse_python(content, lines, file_path))
            elif path.suffix in ['.js', '.ts']:
                components.extend(await self._parse_javascript(content, lines, file_path))
            elif path.suffix in ['.java']:
                components.extend(await self._parse_java(content, lines, file_path))
            else:
                # Generic pattern matching
                components.extend(await self._parse_generic(content, lines, file_path))
            
            logger.debug("Parsed source code", 
                        file_path=file_path, 
                        components_found=len(components))
            
            return components
            
        except Exception as e:
            logger.error("Source code parsing failed", 
                        file_path=file_path, 
                        error=str(e))
            return components
    
    async def _parse_python(self, content: str, lines: List[str], file_path: str) -> List[CryptoComponent]:
        """Parse Python source code."""
        components = []
        
        try:
            # Parse AST for more accurate analysis
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if self._is_crypto_module(alias.name):
                            component = CryptoComponent(
                                name=alias.name,
                                algorithm=alias.name,
                                algorithm_type=CryptoAlgorithmType.SYMMETRIC,  # Default
                                library=alias.name,
                                file_path=file_path,
                                line_number=node.lineno,
                                usage_context="import"
                            )
                            components.append(component)
                
                elif isinstance(node, ast.Call):
                    # Handle method calls like AES.new()
                    if hasattr(node.func, 'attr'):
                        func_name = node.func.attr
                        if self._is_crypto_function(func_name):
                            component = self._create_component_from_call(
                                node, func_name, file_path
                            )
                            if component:
                                components.append(component)
                    
                    # Handle module.function calls like AES.new()
                    if hasattr(node.func, 'value') and hasattr(node.func.value, 'id'):
                        module_name = node.func.value.id
                        func_name = node.func.attr
                        if module_name.upper() in ['AES', 'RSA', 'DES', 'CHACHA20', 'BLOWFISH']:
                            algorithm = module_name.upper()
                            component = CryptoComponent(
                                name=f"{module_name}.{func_name}",
                                algorithm=algorithm,
                                algorithm_type=self._determine_algorithm_type(algorithm),
                                library="Crypto",
                                file_path=file_path,
                                line_number=node.lineno,
                                usage_context=f"method call: {module_name}.{func_name}"
                            )
                            components.append(component)
        
        except SyntaxError:
            # Fallback to regex parsing if AST fails
            components.extend(await self._parse_generic(content, lines, file_path))
        
        return components
    
    async def _parse_javascript(self, content: str, lines: List[str], file_path: str) -> List[CryptoComponent]:
        """Parse JavaScript/TypeScript source code."""
        components = []
        
        # Common JS crypto patterns
        js_patterns = [
            r'require\([\'\"](crypto|node-forge|crypto-js)[\'\"]\)',
            r'import.*from\s+[\'\"](crypto|node-forge|crypto-js)[\'\"\'',
            r'\.createHash\([\'\"](sha1|sha256|sha512|md5)[\'\"]\)',
            r'\.createCipher\([\'\"](aes|des|3des)[\'\"]\)',
        ]
        
        for i, line in enumerate(lines, 1):
            for pattern in js_patterns:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    algorithm = self._extract_algorithm_from_match(match)
                    if algorithm:
                        component = CryptoComponent(
                            name=algorithm,
                            algorithm=algorithm,
                            algorithm_type=self._determine_algorithm_type(algorithm),
                            library="JavaScript Crypto",
                            file_path=file_path,
                            line_number=i,
                            usage_context=line.strip()
                        )
                        components.append(component)
        
        return components
    
    async def _parse_java(self, content: str, lines: List[str], file_path: str) -> List[CryptoComponent]:
        """Parse Java source code."""
        components = []
        
        # Common Java crypto patterns
        java_patterns = [
            r'import\s+javax\.crypto\.',
            r'import\s+java\.security\.',
            r'Cipher\.getInstance\([\'\"](.*?)[\'\"]\)',
            r'MessageDigest\.getInstance\([\'\"](.*?)[\'\"]\)',
            r'KeyGenerator\.getInstance\([\'\"](.*?)[\'\"]\)',
        ]
        
        for i, line in enumerate(lines, 1):
            for pattern in java_patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    algorithm = self._extract_algorithm_from_match(match)
                    if algorithm:
                        component = CryptoComponent(
                            name=algorithm,
                            algorithm=algorithm,
                            algorithm_type=self._determine_algorithm_type(algorithm),
                            library="Java Crypto",
                            file_path=file_path,
                            line_number=i,
                            usage_context=line.strip()
                        )
                        components.append(component)
        
        return components
    
    async def _parse_generic(self, content: str, lines: List[str], file_path: str) -> List[CryptoComponent]:
        """Generic pattern-based parsing."""
        components = []
        
        for category, patterns in self.crypto_patterns.items():
            for pattern in patterns:
                for i, line in enumerate(lines, 1):
                    matches = re.finditer(pattern, line, re.IGNORECASE)
                    for match in matches:
                        algorithm = self._extract_algorithm_from_match(match)
                        if algorithm:
                            component = CryptoComponent(
                                name=algorithm,
                                algorithm=algorithm,
                                algorithm_type=self._determine_algorithm_type(algorithm),
                                library="Unknown",
                                file_path=file_path,
                                line_number=i,
                                usage_context=line.strip()
                            )
                            components.append(component)
        
        return components
    
    def _is_crypto_module(self, module_name: str) -> bool:
        """Check if module name is a cryptographic module."""
        crypto_modules = [
            'cryptography', 'pycryptodome', 'hashlib', 'ssl', 'hmac',
            'OpenSSL', 'Crypto', 'secrets', 'keyring'
        ]
        return any(crypto_mod in module_name for crypto_mod in crypto_modules)
    
    def _is_crypto_function(self, func_name: str) -> bool:
        """Check if function name is cryptographic."""
        crypto_functions = [
            'encrypt', 'decrypt', 'sign', 'verify', 'hash', 'digest',
            'generate_key', 'derive_key', 'mac', 'hmac'
        ]
        return any(crypto_func in func_name.lower() for crypto_func in crypto_functions)
    
    def _create_component_from_call(self, node: ast.Call, func_name: str, file_path: str) -> CryptoComponent:
        """Create crypto component from AST call node."""
        # Extract algorithm from arguments if possible
        algorithm = func_name
        if node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, str):
            algorithm = node.args[0].value
        
        return CryptoComponent(
            name=func_name,
            algorithm=algorithm,
            algorithm_type=self._determine_algorithm_type(algorithm),
            library="Unknown",
            file_path=file_path,
            line_number=node.lineno,
            usage_context=f"function call: {func_name}"
        )
    
    def _extract_algorithm_from_match(self, match: re.Match) -> str:
        """Extract algorithm name from regex match."""
        if match.groups():
            return match.group(1)
        else:
            # Try to extract from the whole match
            text = match.group(0)
            # Look for common algorithm names
            algorithms = ['AES', 'RSA', 'SHA256', 'SHA1', 'MD5', 'DES', '3DES', 'ECDSA']
            for alg in algorithms:
                if alg.lower() in text.lower():
                    return alg
        return "Unknown"
    
    def _determine_algorithm_type(self, algorithm: str) -> CryptoAlgorithmType:
        """Determine the type of cryptographic algorithm."""
        algorithm_lower = algorithm.lower()
        
        if any(sym in algorithm_lower for sym in ['aes', 'des', 'chacha', 'blowfish']):
            return CryptoAlgorithmType.SYMMETRIC
        elif any(asym in algorithm_lower for asym in ['rsa', 'ecc', 'ecdsa', 'dsa', 'kyber', 'dilithium']):
            return CryptoAlgorithmType.ASYMMETRIC
        elif any(hash_alg in algorithm_lower for hash_alg in ['sha', 'md5', 'blake', 'hash']):
            return CryptoAlgorithmType.HASH
        elif any(mac in algorithm_lower for mac in ['hmac', 'cmac', 'gmac']):
            return CryptoAlgorithmType.MAC
        else:
            return CryptoAlgorithmType.SYMMETRIC  # Default


class BinaryCryptoAnalyzer:
    """Analyzer for discovering cryptographic components in binary files."""
    
    async def analyze(self, file_path: str) -> List[CryptoComponent]:
        """Analyze binary file for cryptographic components."""
        components = []
        
        try:
            path = Path(file_path)
            if not path.exists():
                return components
            
            # Read binary file and look for crypto signatures
            with open(path, 'rb') as f:
                content = f.read()
            
            # Convert to string for pattern matching (with error handling)
            text_content = content.decode('utf-8', errors='ignore')
            
            # Look for common crypto library signatures
            crypto_signatures = [
                b'OpenSSL',
                b'libcrypto',
                b'CryptoAPI',
                b'wolfSSL',
                b'mbedTLS',
                b'Botan',
            ]
            
            for signature in crypto_signatures:
                if signature in content:
                    component = CryptoComponent(
                        name=signature.decode('utf-8'),
                        algorithm=signature.decode('utf-8'),
                        algorithm_type=CryptoAlgorithmType.SYMMETRIC,
                        library=signature.decode('utf-8'),
                        file_path=file_path,
                        usage_context="binary signature"
                    )
                    components.append(component)
            
            logger.debug("Analyzed binary file", 
                        file_path=file_path, 
                        components_found=len(components))
            
        except Exception as e:
            logger.error("Binary analysis failed", 
                        file_path=file_path, 
                        error=str(e))
        
        return components


class ContainerLayerScanner:
    """Scanner for discovering cryptographic components in container layers."""
    
    async def scan(self, container_ref: str) -> List[CryptoComponent]:
        """Scan container for cryptographic components."""
        components = []
        
        # Implementation would integrate with Docker API
        # For now, return placeholder
        logger.info("Container scanning not yet implemented", container=container_ref)
        
        return components


class TrafficCryptoInspector:
    """Inspector for discovering cryptographic protocols in network traffic."""
    
    async def inspect(self, endpoint: str) -> List[CryptoComponent]:
        """Inspect network endpoint for cryptographic protocols."""
        components = []
        
        # Implementation would use tools like tshark/wireshark
        # For now, return placeholder
        logger.info("Network traffic inspection not yet implemented", endpoint=endpoint)
        
        return components


class X509CertificateAnalyzer:
    """Analyzer for X.509 certificates and their cryptographic properties."""
    
    async def analyze(self, cert_path: str) -> List[CryptoComponent]:
        """Analyze X.509 certificate for cryptographic components."""
        components = []
        
        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend
            
            path = Path(cert_path)
            if not path.exists():
                return components
            
            # Load certificate
            with open(path, 'rb') as f:
                cert_data = f.read()
            
            try:
                # Try PEM format first
                cert = x509.load_pem_x509_certificate(cert_data, default_backend())
            except:
                # Try DER format
                cert = x509.load_der_x509_certificate(cert_data, default_backend())
            
            # Extract cryptographic information
            public_key = cert.public_key()
            signature_algorithm = cert.signature_algorithm_oid._name
            
            # Create component for public key
            key_component = CryptoComponent(
                name=f"Certificate Public Key",
                algorithm=type(public_key).__name__.replace('PublicKey', ''),
                algorithm_type=CryptoAlgorithmType.ASYMMETRIC,
                key_size=getattr(public_key, 'key_size', None),
                library="X.509 Certificate",
                file_path=cert_path,
                usage_context="certificate public key"
            )
            components.append(key_component)
            
            # Create component for signature algorithm
            sig_component = CryptoComponent(
                name=f"Certificate Signature",
                algorithm=signature_algorithm,
                algorithm_type=CryptoAlgorithmType.SIGNATURE,
                library="X.509 Certificate",
                file_path=cert_path,
                usage_context="certificate signature"
            )
            components.append(sig_component)
            
            logger.debug("Analyzed certificate", 
                        cert_path=cert_path, 
                        components_found=len(components))
            
        except ImportError:
            logger.warning("Cryptography library not available for certificate analysis")
        except Exception as e:
            logger.error("Certificate analysis failed", 
                        cert_path=cert_path, 
                        error=str(e))
        
        return components
