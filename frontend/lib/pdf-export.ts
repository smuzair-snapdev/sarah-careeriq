import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BenchmarkData {
  industry_name: string;
  average_salary: number;
  job_growth_rate: number;
  skills_gap: string[];
  actionable_steps: string[];
  created_at: string;
}

export interface CareerPlan {
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    timeline: string;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    timeline: string;
    status: string;
  }>;
  created_at: string;
}

export function exportBenchmarkToPDF(benchmark: BenchmarkData, userName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CareerIQ Benchmark Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for ${userName}`, pageWidth / 2, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  let yPos = 50;
  
  // Industry Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Industry Overview', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Industry: ${benchmark.industry_name}`, 14, yPos);
  yPos += 7;
  doc.text(`Average Salary: $${benchmark.average_salary.toLocaleString()}`, 14, yPos);
  yPos += 7;
  doc.text(`Job Growth Rate: ${benchmark.job_growth_rate}%`, 14, yPos);
  yPos += 7;
  doc.text(`Generated: ${new Date(benchmark.created_at).toLocaleDateString()}`, 14, yPos);
  yPos += 15;
  
  // Skills Gap Analysis
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Skills Gap Analysis', 14, yPos);
  yPos += 10;
  
  if (benchmark.skills_gap && benchmark.skills_gap.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Skill Gap']],
      body: benchmark.skills_gap.map(skill => [skill]),
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Actionable Steps
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Actionable Steps', 14, yPos);
  yPos += 10;
  
  if (benchmark.actionable_steps && benchmark.actionable_steps.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Action Item']],
      body: benchmark.actionable_steps.map((step, index) => [
        (index + 1).toString(),
        step
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | CareerIQ © ${new Date().getFullYear()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  const fileName = `CareerIQ_Benchmark_${benchmark.industry_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function exportCareerPlanToPDF(plan: CareerPlan, userName: string, industry: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(147, 51, 234); // Purple
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CareerIQ Career Plan', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Personalized Plan for ${userName}`, pageWidth / 2, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  let yPos = 50;
  
  // Plan Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Industry: ${industry}`, 14, yPos);
  yPos += 7;
  doc.text(`Generated: ${new Date(plan.created_at).toLocaleDateString()}`, 14, yPos);
  yPos += 15;
  
  // Recommendations Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 51, 234);
  doc.text('Recommendations', 14, yPos);
  yPos += 10;
  
  if (plan.recommendations && plan.recommendations.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Title', 'Priority', 'Timeline']],
      body: plan.recommendations.map(rec => [
        rec.title,
        rec.priority,
        rec.timeline
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Detailed recommendations
    plan.recommendations.forEach((rec, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${rec.title}`, 14, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      
      const splitDescription = doc.splitTextToSize(rec.description, pageWidth - 28);
      doc.text(splitDescription, 14, yPos);
      yPos += splitDescription.length * 5 + 10;
    });
  }
  
  // Milestones Section
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 51, 234);
  doc.text('Milestones', 14, yPos);
  yPos += 10;
  
  if (plan.milestones && plan.milestones.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Milestone', 'Timeline', 'Status']],
      body: plan.milestones.map(milestone => [
        milestone.title,
        milestone.timeline,
        milestone.status
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Detailed milestones
    plan.milestones.forEach((milestone, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${milestone.title}`, 14, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      
      const splitDescription = doc.splitTextToSize(milestone.description, pageWidth - 28);
      doc.text(splitDescription, 14, yPos);
      yPos += splitDescription.length * 5 + 10;
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | CareerIQ © ${new Date().getFullYear()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  const fileName = `CareerIQ_Plan_${industry.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
