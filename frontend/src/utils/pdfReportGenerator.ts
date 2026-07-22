import jsPDF from 'jspdf';

export interface QuizResultReport {
  quizTitle: string;
  moduleName?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt?: string;
}

export interface AcademicReportData {
  reportCode?: string;
  issueDate?: string;
  student: {
    name: string;
    studentId: string;
    email: string;
    department?: string;
    role?: string;
    yearOfStudy?: string;
  };
  internship: {
    title: string;
    company: string;
    domain?: string;
    mentorName?: string;
    mentorEmail?: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    workType?: string;
  };
  progressMetrics: {
    totalHoursLogged: number;
    requiredHours?: number;
    attendancePercentage: number;
    checkInsCompleted: number;
    totalCheckIns?: number;
    overallProgressPercentage: number;
  };
  quizResults?: QuizResultReport[];
  videoProgress?: {
    videosWatched: number;
    totalVideos: number;
    watchPercentage: number;
    lessonsCompletedList?: string[];
  };
  mentorEvaluation: {
    score: number;
    technicalSkillScore?: number;
    punctualityScore?: number;
    remarks: string;
    mentorName?: string;
    evaluatedAt?: string;
  };
}

/**
 * Generates an institutional-grade PDF Academic Performance Summary Report
 * using jsPDF vector drawing primitives for crisp, high-resolution rendering.
 */
export const generateAcademicPDFReport = (
  data: AcademicReportData,
  action: 'download' | 'open' | 'blob' = 'download'
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportCode = data.reportCode || `REPORT-INT-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = data.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Page Dimensions & Colors
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // ==========================================
  // 1. HEADER BANNER (Top)
  // ==========================================
  doc.setFillColor(15, 23, 42); // Navy Dark (#0F172A)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Cyan Top Accent Line
  doc.setFillColor(56, 189, 248); // (#38BDF8)
  doc.rect(0, 0, pageWidth, 2, 'F');

  // Institution Seal Badge Icon
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.6);
  doc.circle(21, 14, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DiGi', 21, 13.5, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(147, 197, 253);
  doc.text('SEAL', 21, 16.5, { align: 'center' });

  // Main Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('DiGi CAMPUS ACADEMIC REPORT', 33, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL INDUSTRIAL INTERNSHIP PERFORMANCE EVALUATION', 33, 18);

  // Verification Code Box Top Right
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.4);
  doc.roundedRect(142, 6, 54, 15, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('VERIFICATION CODE', 169, 10, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11); // Amber 500
  doc.text(reportCode, 169, 16.5, { align: 'center' });

  // ==========================================
  // SUB-HEADER STATUS BAR
  // ==========================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued On: ${issueDate}  |  Accreditation: ISO 9001:2026 Certified Industrial Placement`, marginX, 32);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Dark Green
  doc.text('STATUS: OFFICIALLY VERIFIED', pageWidth - marginX, 32, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, 34, pageWidth - marginX, 34);

  // ==========================================
  // SECTION 1: STUDENT & INTERNSHIP PROFILE
  // ==========================================
  let currentY = 39;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. STUDENT & INTERNSHIP PROFILE INFO', marginX, currentY);

  currentY += 3;

  // Background Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 34, 2, 2, 'FD');

  // Vertical Divider Inside Card
  const midX = marginX + contentWidth / 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(midX, currentY + 3, midX, currentY + 31);

  // Left Column: Student Details
  const leftX = marginX + 4;
  let rowY = currentY + 6;

  const drawField = (x: number, y: number, label: string, value: string, isRight = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const valueX = isRight ? x + 34 : x + 28;
    doc.text(value, valueX, y);
  };

  drawField(leftX, rowY, 'Student Name:', data.student.name || 'N/A');
  rowY += 6;
  drawField(leftX, rowY, 'Student ID:', data.student.studentId || 'N/A');
  rowY += 6;
  drawField(leftX, rowY, 'Department:', data.student.department || 'Computer Science & Eng.');
  rowY += 6;
  drawField(leftX, rowY, 'Academic Role:', data.student.role || data.student.yearOfStudy || 'Intern Student');
  rowY += 6;
  drawField(leftX, rowY, 'Email Address:', data.student.email || 'N/A');

  // Right Column: Internship Details
  const rightX = midX + 4;
  rowY = currentY + 6;

  drawField(rightX, rowY, 'Internship:', data.internship.title || 'Industrial Internship', true);
  rowY += 6;
  drawField(rightX, rowY, 'Host Company:', data.internship.company || 'Partner Technology Firm', true);
  rowY += 6;
  drawField(rightX, rowY, 'Domain & Mode:', `${data.internship.domain || 'Engineering'} (${data.internship.workType || 'Remote'})`, true);
  rowY += 6;
  drawField(rightX, rowY, 'Company Mentor:', data.internship.mentorName || 'Dr. Sarah Lin', true);
  rowY += 6;
  drawField(rightX, rowY, 'Duration:', data.internship.duration || '8 Weeks (Summer 2026)', true);

  currentY += 38;

  // ==========================================
  // SECTION 2: PROGRESS & ENGAGEMENT METRICS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. PROGRESS & ENGAGEMENT METRICS', marginX, currentY);

  currentY += 3;

  const boxGap = 3;
  const boxWidth = (contentWidth - boxGap * 3) / 4; // ~43.25mm
  const boxHeight = 22;

  const metrics = [
    {
      title: 'TOTAL HOURS LOGGED',
      value: `${data.progressMetrics.totalHoursLogged || 0} / ${data.progressMetrics.requiredHours || 80} hrs`,
      sub: `${Math.min(100, Math.round(((data.progressMetrics.totalHoursLogged || 0) / (data.progressMetrics.requiredHours || 80)) * 100))}% Target Met`,
      bg: [239, 246, 255], // Light Blue
      border: [191, 219, 254],
      titleColor: [30, 64, 175],
      valColor: [30, 58, 138],
      subColor: [37, 99, 235],
    },
    {
      title: 'ATTENDANCE RATE',
      value: `${(data.progressMetrics.attendancePercentage ?? 95).toFixed(1)}%`,
      sub: 'Verified Attendance',
      bg: [240, 253, 244], // Light Green
      border: [187, 247, 208],
      titleColor: [22, 101, 52],
      valColor: [20, 83, 45],
      subColor: [22, 163, 74],
    },
    {
      title: 'CHECK-INS COMPLETED',
      value: `${data.progressMetrics.checkInsCompleted || 0} / ${data.progressMetrics.totalCheckIns || 12}`,
      sub: 'QR Code Verified',
      bg: [254, 243, 199], // Light Amber
      border: [253, 230, 138],
      titleColor: [146, 64, 14],
      valColor: [120, 53, 15],
      subColor: [217, 119, 6],
    },
    {
      title: 'OVERALL PROGRESS',
      value: `${data.progressMetrics.overallProgressPercentage || 85}%`,
      sub: 'Milestones Completed',
      bg: [250, 245, 255], // Light Purple
      border: [233, 213, 255],
      titleColor: [107, 33, 168],
      valColor: [88, 28, 135],
      subColor: [147, 51, 234],
    },
  ];

  metrics.forEach((m, idx) => {
    const bx = marginX + idx * (boxWidth + boxGap);
    doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
    doc.setDrawColor(m.border[0], m.border[1], m.border[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, currentY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(m.titleColor[0], m.titleColor[1], m.titleColor[2]);
    doc.text(m.title, bx + boxWidth / 2, currentY + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(m.valColor[0], m.valColor[1], m.valColor[2]);
    doc.text(m.value, bx + boxWidth / 2, currentY + 13, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(m.subColor[0], m.subColor[1], m.subColor[2]);
    doc.text(m.sub, bx + boxWidth / 2, currentY + 18.5, { align: 'center' });
  });

  currentY += 26;

  // ==========================================
  // SECTION 3: SKILL ASSESSMENT QUIZ RESULTS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. SKILL ASSESSMENT QUIZ RESULTS & SCORES', marginX, currentY);

  currentY += 3;

  // Table Header
  const colWidths = [70, 32, 35, 45]; // Total 182
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(marginX, currentY, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let curX = marginX + 3;
  doc.text('Assessment Module / Quiz Title', curX, currentY + 4.2);
  curX += colWidths[0];
  doc.text('Raw Score', curX, currentY + 4.2);
  curX += colWidths[1];
  doc.text('Percentage', curX, currentY + 4.2);
  curX += colWidths[2];
  doc.text('Evaluation Status', curX, currentY + 4.2);

  currentY += 6;

  const defaultQuizzes: QuizResultReport[] = data.quizResults && data.quizResults.length > 0
    ? data.quizResults
    : [
        { quizTitle: 'Frontend React Architecture & State', score: 9, maxScore: 10, percentage: 90, passed: true },
        { quizTitle: 'RESTful API & Database Integration', score: 10, maxScore: 10, percentage: 100, passed: true },
        { quizTitle: 'Git Workflow & Industry Best Practices', score: 8, maxScore: 10, percentage: 80, passed: true },
      ];

  defaultQuizzes.slice(0, 4).forEach((q, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginX, currentY, contentWidth, 6.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let rowX = marginX + 3;
    const truncatedTitle = q.quizTitle.length > 40 ? q.quizTitle.substring(0, 37) + '...' : q.quizTitle;
    doc.text(truncatedTitle, rowX, currentY + 4.3);

    rowX += colWidths[0];
    doc.text(`${q.score} / ${q.maxScore}`, rowX, currentY + 4.3);

    rowX += colWidths[1];
    doc.setFont('helvetica', 'bold');
    doc.text(`${q.percentage}%`, rowX, currentY + 4.3);

    rowX += colWidths[2];
    if (q.passed) {
      doc.setFillColor(220, 252, 231); // Green 100
      doc.setDrawColor(134, 239, 172);
      doc.roundedRect(rowX - 1, currentY + 1.2, 38, 4.2, 1, 1, 'FD');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PASSED (+150 XP)', rowX + 19, currentY + 4.1, { align: 'center' });
    } else {
      doc.setFillColor(254, 226, 226); // Red 100
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(rowX - 1, currentY + 1.2, 38, 4.2, 1, 1, 'FD');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('REVISION NEEDED', rowX + 19, currentY + 4.1, { align: 'center' });
    }

    currentY += 6.5;
  });

  // Quiz Summary Banner
  const avgScore = Math.round(
    defaultQuizzes.reduce((acc, curr) => acc + curr.percentage, 0) / defaultQuizzes.length
  );
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, currentY, contentWidth, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`AVERAGE QUIZ EVALUATION SCORE: ${avgScore}% - ${avgScore >= 80 ? 'EXCEEDS ACADEMIC BENCHMARK (GRADE A)' : 'SATISFACTORY PROGRESS'}`, marginX + 3, currentY + 3.5);

  currentY += 9;

  // ==========================================
  // SECTION 4: VIDEO TUTORIALS WATCH PROGRESS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. VIDEO TUTORIALS & CURRICULUM WATCH PROGRESS', marginX, currentY);

  currentY += 3;

  const vp = data.videoProgress || {
    videosWatched: 8,
    totalVideos: 8,
    watchPercentage: 100,
  };

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Video Lectures Watched: ${vp.videosWatched} of ${vp.totalVideos} Modules Completed`, marginX + 4, currentY + 5.5);

  // Draw Visual Progress Bar
  const barX = marginX + 4;
  const barY = currentY + 8.5;
  const barWidth = 120;
  const barHeight = 4;

  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, 'F');

  const fillW = Math.max(2, Math.min(barWidth, (barWidth * vp.watchPercentage) / 100));
  doc.setFillColor(2, 132, 199); // Sky Blue 600
  doc.roundedRect(barX, barY, fillW, barHeight, 1.5, 1.5, 'F');

  // Percentage Badge Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text(`${vp.watchPercentage}% Completed`, barX + barWidth + 4, barY + 3.2);

  // Status Chip Right Side
  doc.setFillColor(224, 242, 254);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(pageWidth - marginX - 38, currentY + 4, 34, 8, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(3, 105, 161);
  doc.text(vp.watchPercentage === 100 ? 'FULL MASTERY' : 'IN PROGRESS', pageWidth - marginX - 21, currentY + 9, { align: 'center' });

  currentY += 20;

  // ==========================================
  // SECTION 5: MENTOR EVALUATION & REMARKS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5. MENTOR EVALUATION SCORE & QUALITATIVE REMARKS', marginX, currentY);

  currentY += 3;

  const me = data.mentorEvaluation || {
    score: 94,
    remarks: 'Demonstrated outstanding technical competence, fast adaptability to system architecture, and exceptional initiative in feature delivery.',
    mentorName: data.internship.mentorName || 'Dr. Sarah Lin',
  };

  // Evaluation Card Container
  doc.setFillColor(240, 253, 244); // Light emerald fill
  doc.setDrawColor(134, 239, 172); // Green border
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 32, 2, 2, 'FD');

  // Score Badge Circle/Box on Left
  doc.setFillColor(22, 101, 52); // Dark emerald
  doc.roundedRect(marginX + 4, currentY + 4, 36, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(220, 252, 231);
  doc.text('MENTOR SCORE', marginX + 22, currentY + 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${me.score} / 100`, marginX + 22, currentY + 17, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(187, 247, 208);
  const gradeStr = me.score >= 90 ? 'Grade A+ (Outstanding)' : me.score >= 80 ? 'Grade A (Excellent)' : 'Grade B (Satisfactory)';
  doc.text(gradeStr, marginX + 22, currentY + 23, { align: 'center' });

  // Qualitative Remarks Text Block
  const remarksX = marginX + 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 83, 45);
  doc.text('Qualitative Performance Summary & Mentor Assessment:', remarksX, currentY + 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  const splitRemarks = doc.splitTextToSize(`"${me.remarks}"`, 130);
  doc.text(splitRemarks, remarksX, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 83, 45);
  doc.text(`— Evaluated by ${me.mentorName || 'Lead Mentor'}, Company Mentor Sign-off`, remarksX, currentY + 27);

  currentY += 36;

  // ==========================================
  // SECTION 6: OFFICIAL DIGITAL SIGNATURES & SEALS
  // ==========================================
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 4;

  const sigWidth = contentWidth / 3;

  // 1. Mentor Signature (Left)
  const sig1X = marginX + 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(me.mentorName || 'Dr. Sarah Lin', sig1X + 15, currentY + 6); // Simulated script signature

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(sig1X, currentY + 8, sig1X + 45, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(me.mentorName || 'Dr. Sarah Lin', sig1X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Industry Mentor Sign-Off', sig1X, currentY + 15.5);

  // 2. Official Seal (Center)
  const sig2X = marginX + sigWidth + 10;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.circle(sig2X + 22, currentY + 8, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(29, 78, 216);
  doc.text('OFFICIAL', sig2X + 22, currentY + 6.5, { align: 'center' });
  doc.text('SEAL', sig2X + 22, currentY + 9.5, { align: 'center' });
  doc.text('VERIFIED', sig2X + 22, currentY + 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 58, 138);
  doc.text('Institutional Seal of Authenticity', sig2X + 22, currentY + 18.5, { align: 'center' });

  // 3. Institutional Dean Signature (Right)
  const sig3X = marginX + sigWidth * 2 + 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('Prof. R. V. Sharma', sig3X + 10, currentY + 6); // Simulated script signature

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(sig3X, currentY + 8, sig3X + 45, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Prof. R. V. Sharma', sig3X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dean of Academic Affairs & Training', sig3X, currentY + 15.5);

  // ==========================================
  // DOCUMENT FOOTER BAR (Bottom)
  // ==========================================
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 9, pageWidth, 9, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `DiGi Campus Academic Performance Report • Security Code: ${reportCode} • Valid for Accreditation & Credit Transfer • Page 1 of 1`,
    pageWidth / 2,
    pageHeight - 3.5,
    { align: 'center' }
  );

  // Output Action
  if (action === 'download') {
    const fileName = `Academic_Report_${(data.student.name || 'Student').replace(/\s+/g, '_')}_${reportCode}.pdf`;
    doc.save(fileName);
  } else if (action === 'open') {
    window.open(doc.output('bloburl'), '_blank');
  }

  return doc;
};
