import React, { useState } from 'react';
import { Protocol } from '../../types/protocol';

interface AuditReportGeneratorProps {
  protocols: Protocol[];
}

interface ReportSection {
  title: string;
  findings: any;
}

export const AuditReportGenerator: React.FC<AuditReportGeneratorProps> = ({ protocols }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [reportType, setReportType] = useState<'comprehensive' | 'smart-contract' | 'risk-assessment' | 'compliance'>('comprehensive');
  const [includeOptions, setIncludeOptions] = useState({
    securityScan: true,
    vulnerabilityAnalysis: true,
    codeQuality: true,
    bestPractices: true,
    industryComparison: false,
    regulatoryCompliance: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'compiling' | 'done' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [reportData, setReportData] = useState<any>(null);
  
  const handleOptionChange = (option: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleGenerateReport = () => {
    if (!selectedProtocol) {
      alert('Please select a protocol');
      return;
    }
    
    setIsGenerating(true);
    setGenerationStatus('scanning');
    setGenerationProgress(0);
    
    // Get the selected protocol details
    const protocol = protocols.find(p => p.address === selectedProtocol);
    if (!protocol) {
      setGenerationStatus('error');
      return;
    }
    
    // Simulate the report generation process
    const simulateGeneration = () => {
      const stages = ['scanning', 'analyzing', 'compiling', 'done'];
      let currentStage = 0;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          currentStage++;
          
          if (currentStage >= stages.length) {
            clearInterval(interval);
            setGenerationStatus('done');
            
            // Generate the actual report data
            generateReportData(protocol);
            return;
          }
          
          setGenerationStatus(stages[currentStage] as any);
          progress = 0;
        }
        
        setGenerationProgress(Math.min(progress, 100));
      }, 500);
      
      // Simulate completion after some time
      setTimeout(() => {
        clearInterval(interval);
        setGenerationStatus('done');
        setGenerationProgress(100);
        
        // Generate the actual report data
        generateReportData(protocol);
      }, 10000); // 10 seconds
    };
    
    simulateGeneration();
  };
  
  const generateReportData = (protocol: Protocol) => {
    // Generate realistic report data based on protocol and selected options
    const report = {
      id: `report-${Date.now()}`,
      protocol: {
        name: protocol.name,
        address: protocol.address,
        riskScore: protocol.riskScore,
        tvl: protocol.tvl || 0,
        isActive: protocol.isActive,
        lastUpdateTime: protocol.lastUpdateTime,
        anomalyCount: protocol.anomalyCount || 0,
        deployments: protocol.deployments || {}
      },
      reportType: reportType,
      timestamp: new Date().toISOString(),
      summary: {
        riskLevel: protocol.riskScore > 75 ? 'High' : protocol.riskScore > 50 ? 'Medium' : 'Low',
        overview: `This ${reportType} report analyzes the ${protocol.name} protocol, which currently has a risk score of ${protocol.riskScore}/100.`,
        keyFindings: [
          `${protocol.riskScore > 70 ? 'Critical' : protocol.riskScore > 50 ? 'High' : 'Low'} security risk detected in contract implementation`,
          'Code quality meets industry standards with minor improvements suggested',
          protocol.riskScore > 60 ? 'Potential centralization vulnerabilities detected' : 'No significant centralization issues found'
        ],
        recommendations: [
          'Implement additional security measures for high-risk functions',
          'Improve input validation in user-facing contracts',
          'Consider formal verification for core functions'
        ]
      },
      sections: [] as ReportSection[]
    };
    
    // Add sections based on included options
    if (includeOptions.securityScan) {
      report.sections.push({
        title: 'Security Scan Results',
        findings: generateSecurityScanResults(protocol)
      });
    }
    
    if (includeOptions.vulnerabilityAnalysis) {
      report.sections.push({
        title: 'Vulnerability Analysis',
        findings: generateVulnerabilityAnalysis(protocol)
      });
    }
    
    if (includeOptions.codeQuality) {
      report.sections.push({
        title: 'Code Quality Assessment',
        findings: generateCodeQualityAssessment(protocol)
      });
    }
    
    if (includeOptions.bestPractices) {
      report.sections.push({
        title: 'Best Practices Review',
        findings: generateBestPracticesReview(protocol)
      });
    }
    
    if (includeOptions.industryComparison) {
      report.sections.push({
        title: 'Industry Comparison',
        findings: generateIndustryComparison(protocol)
      });
    }
    
    if (includeOptions.regulatoryCompliance) {
      report.sections.push({
        title: 'Regulatory Compliance',
        findings: generateRegulatoryCompliance(protocol)
      });
    }
    
    setReportData(report);
  };
  
  // Helper functions to generate report sections
  const generateSecurityScanResults = (protocol: Protocol) => {
    return {
      vulnerabilitiesFound: Math.floor(protocol.riskScore / 20),
      criticalIssues: protocol.riskScore > 75 ? Math.floor(Math.random() * 3) + 1 : 0,
      highIssues: protocol.riskScore > 50 ? Math.floor(Math.random() * 5) + 1 : 0,
      mediumIssues: Math.floor(Math.random() * 8) + 1,
      lowIssues: Math.floor(Math.random() * 12) + 2,
      details: [
        {
          severity: protocol.riskScore > 75 ? 'Critical' : protocol.riskScore > 50 ? 'High' : 'Medium',
          title: 'Reentrancy Vulnerability',
          description: 'Potential reentrancy vulnerability detected in withdraw function'
        },
        {
          severity: 'Medium',
          title: 'Timestamp Dependency',
          description: 'Contract uses timestamp for critical operations'
        },
        {
          severity: 'Low',
          title: 'Gas Optimization',
          description: 'Several functions could be optimized for lower gas consumption'
        }
      ]
    };
  };
  
  const generateVulnerabilityAnalysis = (protocol: Protocol) => {
    // Generate mock vulnerability analysis
    return {
      riskPattern: protocol.riskScore > 70 ? 'High-risk' : protocol.riskScore > 40 ? 'Medium-risk' : 'Low-risk',
      attackVector: protocol.riskScore > 60 ? 'Multiple potential attack vectors identified' : 'Limited attack surface',
      details: [
        {
          title: 'Access Control',
          risk: protocol.riskScore > 60 ? 'High' : 'Low',
          description: 'Analysis of permission structures and administrative capabilities'
        },
        {
          title: 'External Dependencies',
          risk: 'Medium',
          description: 'Assessment of risks from oracle and external contract dependencies'
        }
      ]
    };
  };
  
  const generateCodeQualityAssessment = (protocol: Protocol) => {
    // Generate mock code quality assessment
    return {
      overallScore: Math.floor(80 + (Math.random() * 15)),
      metrics: {
        complexity: Math.floor(70 + (Math.random() * 20)),
        maintainability: Math.floor(75 + (Math.random() * 20)),
        documentation: Math.floor(60 + (Math.random() * 30)),
        testCoverage: Math.floor(65 + (Math.random() * 25))
      }
    };
  };
  
  const generateBestPracticesReview = (protocol: Protocol) => {
    // Generate mock best practices review
    return {
      complianceScore: Math.floor(70 + (Math.random() * 25)),
      findings: [
        'Follows OpenZeppelin security patterns',
        protocol.riskScore < 50 ? 'Good test coverage' : 'Insufficient test coverage',
        'Clear function documentation',
        protocol.riskScore > 60 ? 'Administrative functions lack time locks' : 'Appropriate time locks on sensitive functions'
      ]
    };
  };
  
  const generateIndustryComparison = (protocol: Protocol) => {
    // Generate mock industry comparison
    return {
      similiarProtocols: ['Aave', 'Compound', 'MakerDAO'].filter(name => name !== protocol.name),
      riskComparison: {
        thisProtocol: protocol.riskScore,
        industryAverage: 45,
        topPerformer: 15
      },
      securityRanking: `${Math.floor(Math.random() * 10) + 1} out of 20`
    };
  };
  
  const generateRegulatoryCompliance = (protocol: Protocol) => {
    // Generate mock regulatory compliance
    return {
      complianceStatus: protocol.riskScore < 50 ? 'Largely Compliant' : 'Partial Compliance',
      regulations: [
        { name: 'KYC/AML Requirements', status: protocol.riskScore < 60 ? 'Compliant' : 'Partially Compliant' },
        { name: 'Data Protection', status: 'Compliant' },
        { name: 'Financial Regulations', status: protocol.riskScore < 40 ? 'Compliant' : 'Requires Review' }
      ]
    };
  };
  
  const handleDownloadReport = () => {
    if (!reportData) {
      alert('No report data available');
      return;
    }
    
    // Create the report content
    const protocol = protocols.find(p => p.address === selectedProtocol);
    if (!protocol) return;
    
    // Create a report as a JSON object
    const reportJson = JSON.stringify(reportData, null, 2);
    
    // Create a Blob containing the JSON data
    const blob = new Blob([reportJson], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${protocol.name.replace(/\s+/g, '_')}_${reportType}_Report.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Reset the state for a new report generation
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStatus('idle');
      setGenerationProgress(0);
      setReportData(null);
    }, 1000);
    
    // Add this report to the history (would normally be done via API)
    const newReport = {
      id: `rep-${Date.now()}`,
      protocolName: protocol.name,
      protocolAddress: protocol.address,
      reportType: getReportTypeLabel(reportType),
      createdAt: new Date(),
      status: 'completed' as const
    };
    
    // Here you would call an API to save the report to history
    console.log('Adding report to history:', newReport);
  };
  
  // Get a translation of the current status for display
  const getStatusText = () => {
    switch (generationStatus) {
      case 'scanning': return 'Scanning smart contract code...';
      case 'analyzing': return 'Analyzing security patterns and vulnerabilities...';
      case 'compiling': return 'Compiling report findings...';
      case 'done': return 'Report generation complete!';
      case 'error': return 'Error generating report. Please try again.';
      default: return '';
    }
  };
  
  // Get a human-readable report type label
  const getReportTypeLabel = (type: string): string => {
    switch (type) {
      case 'comprehensive': return 'Comprehensive Audit';
      case 'smart-contract': return 'Smart Contract Scan';
      case 'risk-assessment': return 'Risk Assessment';
      case 'compliance': return 'Compliance Report';
      default: return type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Generate Audit Report</h2>
      
      {!isGenerating ? (
        // Report configuration form
        <div className="space-y-6">
          {/* Protocol Selection */}
          <div>
            <label htmlFor="protocol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Protocol
            </label>
            <select
              id="protocol"
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a protocol</option>
              {protocols.map((protocol) => (
                <option key={protocol.address} value={protocol.address}>
                  {protocol.name} (Risk Score: {protocol.riskScore})
                </option>
              ))}
            </select>
          </div>
          
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`
                relative border rounded-lg p-4 flex cursor-pointer focus:outline-none
                ${reportType === 'comprehensive' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'}
              `}>
                <input 
                  type="radio" 
                  name="report-type" 
                  value="comprehensive" 
                  className="sr-only"
                  checked={reportType === 'comprehensive'}
                  onChange={() => setReportType('comprehensive')}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Comprehensive Audit</div>
                    {reportType === 'comprehensive' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Full security assessment including code analysis, risk evaluation, and best practices review
                  </div>
                </div>
              </label>
              
              <label className={`
                relative border rounded-lg p-4 flex cursor-pointer focus:outline-none
                ${reportType === 'smart-contract' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'}
              `}>
                <input 
                  type="radio" 
                  name="report-type" 
                  value="smart-contract" 
                  className="sr-only"
                  checked={reportType === 'smart-contract'}
                  onChange={() => setReportType('smart-contract')}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Smart Contract Scan</div>
                    {reportType === 'smart-contract' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Focused analysis of smart contract code for security vulnerabilities
                  </div>
                </div>
              </label>
              
              <label className={`
                relative border rounded-lg p-4 flex cursor-pointer focus:outline-none
                ${reportType === 'risk-assessment' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'}
              `}>
                <input 
                  type="radio" 
                  name="report-type" 
                  value="risk-assessment" 
                  className="sr-only"
                  checked={reportType === 'risk-assessment'}
                  onChange={() => setReportType('risk-assessment')}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Risk Assessment</div>
                    {reportType === 'risk-assessment' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Evaluation of protocol risk factors and recommended exposure limits
                  </div>
                </div>
              </label>
              
              <label className={`
                relative border rounded-lg p-4 flex cursor-pointer focus:outline-none
                ${reportType === 'compliance' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'}
              `}>
                <input 
                  type="radio" 
                  name="report-type" 
                  value="compliance" 
                  className="sr-only"
                  checked={reportType === 'compliance'}
                  onChange={() => setReportType('compliance')}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Compliance Report</div>
                    {reportType === 'compliance' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Regulatory compliance analysis and documentation for institutional requirements
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Report Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include in Report
            </label>
            <div className="space-y-3">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="security-scan"
                    type="checkbox"
                    checked={includeOptions.securityScan}
                    onChange={() => handleOptionChange('securityScan')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="security-scan" className="font-medium text-gray-700 dark:text-gray-300">Security Scan</label>
                  <p className="text-gray-500 dark:text-gray-400">Vulnerability scanning and threat detection</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="vulnerability-analysis"
                    type="checkbox"
                    checked={includeOptions.vulnerabilityAnalysis}
                    onChange={() => handleOptionChange('vulnerabilityAnalysis')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="vulnerability-analysis" className="font-medium text-gray-700 dark:text-gray-300">Vulnerability Analysis</label>
                  <p className="text-gray-500 dark:text-gray-400">In-depth analysis of detected vulnerabilities</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="code-quality"
                    type="checkbox"
                    checked={includeOptions.codeQuality}
                    onChange={() => handleOptionChange('codeQuality')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="code-quality" className="font-medium text-gray-700 dark:text-gray-300">Code Quality</label>
                  <p className="text-gray-500 dark:text-gray-400">Assessment of code quality and potential optimizations</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="best-practices"
                    type="checkbox"
                    checked={includeOptions.bestPractices}
                    onChange={() => handleOptionChange('bestPractices')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="best-practices" className="font-medium text-gray-700 dark:text-gray-300">Best Practices</label>
                  <p className="text-gray-500 dark:text-gray-400">Recommendations based on industry best practices</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="industry-comparison"
                    type="checkbox"
                    checked={includeOptions.industryComparison}
                    onChange={() => handleOptionChange('industryComparison')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="industry-comparison" className="font-medium text-gray-700 dark:text-gray-300">Industry Comparison</label>
                  <p className="text-gray-500 dark:text-gray-400">Benchmark against similar protocols in the industry</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="regulatory-compliance"
                    type="checkbox"
                    checked={includeOptions.regulatoryCompliance}
                    onChange={() => handleOptionChange('regulatoryCompliance')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="regulatory-compliance" className="font-medium text-gray-700 dark:text-gray-300">Regulatory Compliance</label>
                  <p className="text-gray-500 dark:text-gray-400">Analysis of compliance with relevant regulations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate Report
            </button>
          </div>
        </div>
      ) : (
        // Report generation status
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {generationStatus === 'done' ? 'Report Generated' : 'Generating Report'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getStatusText()}
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${generationProgress}%` }}></div>
          </div>
          
          {generationStatus === 'done' && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF Report
              </button>
            </div>
          )}
          
          {generationStatus !== 'done' && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsGenerating(false);
                  setGenerationStatus('idle');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 