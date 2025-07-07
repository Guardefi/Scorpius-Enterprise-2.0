"""Exporters for CBOM reports in various formats."""

import json
import xml.etree.ElementTree as ET
from typing import Dict, Any
from datetime import datetime

from ...core.logging import get_logger
from .models import CBOMReport

logger = get_logger(__name__)


class JSONExporter:
    """Export CBOM reports to JSON format."""

    def export(self, report: CBOMReport) -> str:
        """Export report to JSON string."""
        logger.info("Exporting CBOM report to JSON", report_id=str(report.id))
        
        try:
            # Convert report to dictionary and handle serialization
            report_dict = report.dict()
            
            # Convert datetime objects to ISO format strings
            self._serialize_datetime_objects(report_dict)
            
            return json.dumps(report_dict, indent=2, ensure_ascii=False)
            
        except Exception as e:
            logger.error("Failed to export to JSON", error=str(e))
            raise

    def _serialize_datetime_objects(self, obj):
        """Recursively serialize datetime objects to ISO format."""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, datetime):
                    obj[key] = value.isoformat()
                elif isinstance(value, (dict, list)):
                    self._serialize_datetime_objects(value)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                if isinstance(item, datetime):
                    obj[i] = item.isoformat()
                elif isinstance(item, (dict, list)):
                    self._serialize_datetime_objects(item)


class CycloneDXExporter:
    """Export CBOM reports to CycloneDX format."""

    def __init__(self):
        """Initialize CycloneDX exporter."""
        self.cyclone_dx_version = "1.4"
        self.spec_version = "1.4"

    def export(self, report: CBOMReport) -> str:
        """Export report to CycloneDX JSON format."""
        logger.info("Exporting CBOM report to CycloneDX", report_id=str(report.id))
        
        try:
            cyclone_dx_report = self._convert_to_cyclone_dx(report)
            return json.dumps(cyclone_dx_report, indent=2, ensure_ascii=False)
            
        except Exception as e:
            logger.error("Failed to export to CycloneDX", error=str(e))
            raise

    def _convert_to_cyclone_dx(self, report: CBOMReport) -> Dict[str, Any]:
        """Convert CBOM report to CycloneDX format."""
        cyclone_dx = {
            "bomFormat": "CycloneDX",
            "specVersion": self.spec_version,
            "serialNumber": f"urn:uuid:{report.scan_id}",
            "version": 1,
            "metadata": {
                "timestamp": report.generated_at.isoformat(),
                "tools": [
                    {
                        "vendor": "Quantum Security Platform",
                        "name": "Quantum Scanner",
                        "version": "1.0.0"
                    }
                ],
                "authors": [
                    {
                        "name": "Quantum Security Platform"
                    }
                ],
                "properties": [
                    {
                        "name": "quantum:scan_id",
                        "value": str(report.scan_id)
                    },
                    {
                        "name": "quantum:total_components",
                        "value": str(report.total_components)
                    },
                    {
                        "name": "quantum:vulnerable_components",
                        "value": str(report.quantum_vulnerable_count)
                    },
                    {
                        "name": "quantum:fips_compliant_components",
                        "value": str(report.fips_compliant_count)
                    }
                ]
            },
            "components": []
        }

        # Convert CBOM entries to CycloneDX components
        for entry in report.entries:
            component = self._convert_entry_to_component(entry)
            cyclone_dx["components"].append(component)

        return cyclone_dx

    def _convert_entry_to_component(self, entry) -> Dict[str, Any]:
        """Convert CBOM entry to CycloneDX component."""
        component = {
            "type": "cryptographic-asset",
            "bom-ref": str(entry.id),
            "name": entry.component.name,
            "version": entry.component.version or "unknown",
            "description": f"{entry.component.algorithm} cryptographic component",
            "properties": [
                {
                    "name": "quantum:algorithm",
                    "value": entry.component.algorithm
                },
                {
                    "name": "quantum:algorithm_type",
                    "value": entry.component.algorithm_type.value
                },
                {
                    "name": "quantum:vulnerability_level",
                    "value": entry.quantum_assessment.vulnerability_level.value
                },
                {
                    "name": "quantum:is_vulnerable",
                    "value": str(entry.quantum_assessment.is_vulnerable).lower()
                },
                {
                    "name": "quantum:migration_priority",
                    "value": entry.quantum_assessment.migration_priority
                },
                {
                    "name": "quantum:fips_compliant",
                    "value": str(entry.fips_compliant).lower()
                },
                {
                    "name": "quantum:assessment_confidence",
                    "value": str(entry.quantum_assessment.assessment_confidence)
                }
            ]
        }

        # Add key size if available
        if entry.component.key_size:
            component["properties"].append({
                "name": "quantum:key_size",
                "value": str(entry.component.key_size)
            })

        # Add library if available
        if entry.component.library:
            component["properties"].append({
                "name": "quantum:library",
                "value": entry.component.library
            })

        # Add file location if available
        if entry.component.file_path:
            component["properties"].append({
                "name": "quantum:file_path",
                "value": entry.component.file_path
            })

        # Add recommended replacement if available
        if entry.quantum_assessment.recommended_replacement:
            component["properties"].append({
                "name": "quantum:recommended_replacement",
                "value": entry.quantum_assessment.recommended_replacement
            })

        return component


class XMLExporter:
    """Export CBOM reports to XML format."""

    def export(self, report: CBOMReport) -> str:
        """Export report to XML format."""
        logger.info("Exporting CBOM report to XML", report_id=str(report.id))
        
        try:
            root = self._create_xml_report(report)
            return ET.tostring(root, encoding='unicode', xml_declaration=True)
            
        except Exception as e:
            logger.error("Failed to export to XML", error=str(e))
            raise

    def _create_xml_report(self, report: CBOMReport) -> ET.Element:
        """Create XML representation of CBOM report."""
        root = ET.Element("cbom_report")
        root.set("id", str(report.id))
        root.set("scan_id", str(report.scan_id))
        root.set("generated_at", report.generated_at.isoformat())

        # Add metadata
        metadata = ET.SubElement(root, "metadata")
        ET.SubElement(metadata, "title").text = report.title
        if report.description:
            ET.SubElement(metadata, "description").text = report.description
        
        # Add summary statistics
        summary = ET.SubElement(root, "summary")
        ET.SubElement(summary, "total_components").text = str(report.total_components)
        ET.SubElement(summary, "quantum_vulnerable_count").text = str(report.quantum_vulnerable_count)
        ET.SubElement(summary, "fips_compliant_count").text = str(report.fips_compliant_count)

        # Add vulnerability breakdown
        breakdown = ET.SubElement(summary, "vulnerability_breakdown")
        for level, count in report.vulnerability_breakdown.items():
            level_elem = ET.SubElement(breakdown, "level")
            level_elem.set("name", level)
            level_elem.text = str(count)

        # Add scanned assets
        assets = ET.SubElement(root, "scanned_assets")
        for asset in report.scanned_assets:
            asset_elem = ET.SubElement(assets, "asset")
            asset_elem.set("id", str(asset.id))
            asset_elem.set("type", asset.type.value)
            ET.SubElement(asset_elem, "name").text = asset.name
            ET.SubElement(asset_elem, "location").text = asset.location

        # Add CBOM entries
        entries = ET.SubElement(root, "entries")
        for entry in report.entries:
            entry_elem = self._create_entry_element(entry)
            entries.append(entry_elem)

        return root

    def _create_entry_element(self, entry) -> ET.Element:
        """Create XML element for CBOM entry."""
        entry_elem = ET.Element("entry")
        entry_elem.set("id", str(entry.id))
        entry_elem.set("discovered_at", entry.discovered_at.isoformat())

        # Add component details
        component = ET.SubElement(entry_elem, "component")
        component.set("id", str(entry.component.id))
        ET.SubElement(component, "name").text = entry.component.name
        ET.SubElement(component, "algorithm").text = entry.component.algorithm
        ET.SubElement(component, "algorithm_type").text = entry.component.algorithm_type.value
        
        if entry.component.key_size:
            ET.SubElement(component, "key_size").text = str(entry.component.key_size)
        if entry.component.version:
            ET.SubElement(component, "version").text = entry.component.version
        if entry.component.library:
            ET.SubElement(component, "library").text = entry.component.library
        if entry.component.file_path:
            ET.SubElement(component, "file_path").text = entry.component.file_path

        # Add quantum assessment
        assessment = ET.SubElement(entry_elem, "quantum_assessment")
        ET.SubElement(assessment, "vulnerability_level").text = entry.quantum_assessment.vulnerability_level.value
        ET.SubElement(assessment, "is_vulnerable").text = str(entry.quantum_assessment.is_vulnerable).lower()
        ET.SubElement(assessment, "migration_priority").text = entry.quantum_assessment.migration_priority
        ET.SubElement(assessment, "assessment_confidence").text = str(entry.quantum_assessment.assessment_confidence)
        
        if entry.quantum_assessment.recommended_replacement:
            ET.SubElement(assessment, "recommended_replacement").text = entry.quantum_assessment.recommended_replacement
        if entry.quantum_assessment.estimated_break_time:
            ET.SubElement(assessment, "estimated_break_time").text = entry.quantum_assessment.estimated_break_time

        # Add compliance information
        compliance = ET.SubElement(entry_elem, "compliance")
        ET.SubElement(compliance, "fips_compliant").text = str(entry.fips_compliant).lower()

        return entry_elem


class CSVExporter:
    """Export CBOM reports to CSV format."""

    def export(self, report: CBOMReport) -> str:
        """Export report to CSV format."""
        logger.info("Exporting CBOM report to CSV", report_id=str(report.id))
        
        try:
            lines = []
            
            # Add CSV header
            header = [
                "Component Name", "Algorithm", "Algorithm Type", "Key Size",
                "Library", "File Path", "Line Number", "Vulnerability Level",
                "Is Vulnerable", "Migration Priority", "FIPS Compliant",
                "Recommended Replacement", "Assessment Confidence", "Discovered At"
            ]
            lines.append(",".join(f'"{col}"' for col in header))
            
            # Add data rows
            for entry in report.entries:
                row = [
                    entry.component.name,
                    entry.component.algorithm,
                    entry.component.algorithm_type.value,
                    str(entry.component.key_size) if entry.component.key_size else "",
                    entry.component.library or "",
                    entry.component.file_path or "",
                    str(entry.component.line_number) if entry.component.line_number else "",
                    entry.quantum_assessment.vulnerability_level.value,
                    str(entry.quantum_assessment.is_vulnerable),
                    entry.quantum_assessment.migration_priority,
                    str(entry.fips_compliant),
                    entry.quantum_assessment.recommended_replacement or "",
                    str(entry.quantum_assessment.assessment_confidence),
                    entry.discovered_at.isoformat()
                ]
                lines.append(",".join(f'"{cell}"' for cell in row))
            
            return "\n".join(lines)
            
        except Exception as e:
            logger.error("Failed to export to CSV", error=str(e))
            raise
