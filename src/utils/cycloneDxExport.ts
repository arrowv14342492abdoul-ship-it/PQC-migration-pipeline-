import { CbomItem } from '../types/pqc';

export function exportCycloneDx16Cbom(projectName: string, items: CbomItem[]): void {
  const bomDocument = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: 'Sovereign Defense Operations',
          name: 'PQC-Migration-Pipeline',
          version: '2.0.0',
        },
      ],
      component: {
        type: 'application',
        name: projectName,
        'bom-ref': `app-${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      },
    },
    components: items.map((item) => ({
      type: 'cryptographic-asset',
      'bom-ref': item.bomRef || `crypto-${item.id}`,
      name: item.primitive,
      evidence: {
        occurrences: [
          {
            location: item.fileLocation || 'source_module',
            line: item.lineNumber,
          },
        ],
      },
      cryptoProperties: item.cycloneDx,
      properties: [
        { name: 'pqc:quantumVulnerability', value: item.quantumVulnerability },
        { name: 'pqc:nistReplacement', value: item.nistReplacement },
        { name: 'pqc:hybridRecommendation', value: item.hybridRecommendation },
        { name: 'pqc:estimatedCycleOverheadPct', value: String(item.estimatedCycleOverheadPct) },
      ],
    })),
  };

  const blob = new Blob([JSON.stringify(bomDocument, null, 2)], {
    type: 'application/vnd.cyclonedx+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_cyclonedx_cbom_v1.6.json`;
  a.click();
  URL.revokeObjectURL(url);
}
