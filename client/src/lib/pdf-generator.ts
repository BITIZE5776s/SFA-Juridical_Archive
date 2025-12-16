import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SystemReport } from "@shared/schema";

export class PDFGenerator {
  private static formatNumber(num: number | string): string {
    const numStr = num.toString();
    const arabicToEnglish: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return numStr.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit] || digit);
  }

  private static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private static formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  private static formatMixedText(text: string): string {
    return `<span class="mixed-text">${text}</span>`;
  }

  private static formatUserName(userName: string, userRole: string): string {
    const roleTranslations: { [key: string]: string } = {
      'admin': 'مدير',
      'archivist': 'أمين الأرشيف',
      'viewer': 'مشاهد'
    };

    const translatedRole = roleTranslations[userRole] || userRole;
    return this.formatMixedText(`${userName} <span class="ltr">(${userRole})</span>`);
  }

  private static createReportHTML(report: SystemReport): string {
    const reportData = this.formatReportData(report);

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
          
          :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #64748b;
            --accent: #f59e0b;
            --background: #ffffff;
            --surface: #f8fafc;
            --border: #e2e8f0;
            --text-main: #1e293b;
            --text-light: #64748b;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Arabic', 'Amiri', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.6;
            color: var(--text-main);
            background: var(--background);
            padding: 40px; /* Generous padding to avoid edge cutting */
            width: 100%;
            height: 100%;
          }
          
          /* Mixed language support */
          .mixed-text {
            unicode-bidi: embed;
            direction: rtl;
          }
          
          .mixed-text .ltr {
            direction: ltr;
            unicode-bidi: embed;
            display: inline-block;
            margin: 0 4px;
          }
          
          .header {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .header h2 {
            font-size: 18px;
            font-weight: 500;
            opacity: 0.95;
          }
          
          .report-info {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 40px;
          }
          
          .section-title {
            color: var(--primary);
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--primary);
            display: flex;
            align-items: center;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid var(--border);
          }
          
          .info-label {
            font-weight: 600;
            color: var(--secondary);
            font-size: 14px;
          }
          
          .info-value {
            color: var(--text-main);
            font-weight: 700;
          }
          
          .content-section {
            margin-bottom: 40px;
            break-inside: avoid; /* Try to avoid breaking inside sections */
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }
          
          .stat-card {
            background: white;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px 16px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }
          
          .stat-number {
            font-size: 32px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 8px;
            line-height: 1;
          }
          
          .stat-label {
            color: var(--secondary);
            font-size: 13px;
            font-weight: 500;
          }
          
          .list-container {
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
          }

          .list-item {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
          }
          
          .list-item:last-child {
            border-bottom: none;
          }
          
          .list-item:nth-child(even) {
            background: var(--surface);
          }
          
          .list-label {
            font-weight: 600;
            color: var(--text-main);
          }
          
          .list-value {
            color: var(--primary);
            background: #eff6ff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            min-width: 40px;
            text-align: center;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 24px;
            border-top: 2px solid var(--border);
            text-align: center;
            color: var(--secondary);
            font-size: 12px;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.getReportTypeLabel(report.report_type)}</h1>
          <h2>${report.title}</h2>
        </div>
        
        <div class="report-info">
          <div class="section-title">معلومات التقرير</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء</span>
              <span class="info-value">${this.formatDate(report.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">وقت الإنشاء</span>
              <span class="info-value">${this.formatTime(report.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">نوع التقرير</span>
              <span class="info-value">${this.getReportTypeLabel(report.report_type)}</span>
            </div>
            ${report.description ? `
            <div class="info-item">
              <span class="info-label">الوصف</span>
              <span class="info-value">${report.description}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${reportData}
        
        <div class="footer">
          <span>تم إنشاء هذا التقرير تلقائياً بواسطة نظام الأرشيف القضائي</span>
          <span>${this.formatDate(new Date())} - ${this.formatTime(new Date())}</span>
        </div>
      </body>
      </html>
    `;
  }

  private static formatReportData(report: SystemReport): string {
    switch (report.report_type) {
      case 'user_activity':
        return this.formatUserActivityData(report.data);
      case 'document_stats':
        return this.formatDocumentStatsData(report.data);
      case 'system_health':
        return this.formatSystemHealthData(report.data);
      case 'security_audit':
        return this.formatSecurityAuditData(report.data);
      default:
        return '<div class="content-section"><h3>بيانات التقرير</h3><p>لا توجد بيانات متاحة</p></div>';
    }
  }

  private static getReportTypeLabel(type: string): string {
    const labels = {
      'user_activity': 'تقرير نشاط المستخدمين',
      'document_stats': 'تقرير إحصائيات الوثائق',
      'system_health': 'تقرير صحة النظام',
      'security_audit': 'تقرير مراجعة الأمان'
    };
    return labels[type as keyof typeof labels] || type;
  }

  static async generateReportPDF(report: SystemReport): Promise<void> {
    try {
      const htmlContent = this.createReportHTML(report);

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      // Use slightly less than A4 width to ensure margins
      tempContainer.style.width = '210mm';
      document.body.appendChild(tempContainer);

      await document.fonts.ready;

      // Wait a bit for any layout shifts
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit width while maintaining aspect ratio
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // This puts the top of the image off-screen upwards

        // We need to shift detailed pages correctly
        // The previous logic 'position = heightLeft - imgHeight' seems wrong if heightLeft decreases.
        // If we want to show the NEXT chunk:
        // Page 1 shows 0 to pdfHeight.
        // Page 2 should show pdfHeight to 2*pdfHeight.
        // To show that, we place the image at Y = -pdfHeight.

        position = - (imgHeight - heightLeft);

        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${report.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('فشل في إنشاء ملف PDF');
    }
  }

  private static formatUserActivityData(data: any): string {
    return `
      <div class="content-section">
        <div class="section-title">ملخص النشاط</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.totalActivities || 0)}</div>
            <div class="stat-label">إجمالي الأنشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.activeUsers || 0)}</div>
            <div class="stat-label">المستخدمون النشطون</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.period || 'غير محدد'}</div>
            <div class="stat-label">الفترة الزمنية</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">توزيع الأنشطة</div>
        <div class="list-container">
          <div class="list-item">
            <span class="list-label">الوثائق</span>
            <span class="list-value">${this.formatNumber(data.activityBreakdown?.documentActions || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">المستخدمون</span>
            <span class="list-value">${this.formatNumber(data.activityBreakdown?.userActions || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">التعليقات</span>
            <span class="list-value">${this.formatNumber(data.activityBreakdown?.commentActions || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">التقارير</span>
            <span class="list-value">${this.formatNumber(data.activityBreakdown?.reportActions || 0)}</span>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">أكثر المستخدمين نشاطاً</div>
        <div class="list-container">
          ${(data.userStats || []).slice(0, 5).map((user: any, index: number) => `
            <div class="list-item">
              <span class="list-label">${this.formatNumber(index + 1)}. ${this.formatUserName(user.userName || 'غير محدد', user.userRole || 'غير محدد')}</span>
              <span class="list-value">${this.formatNumber(user.activityCount || 0)} نشاط</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private static formatDocumentStatsData(data: any): string {
    return `
      <div class="content-section">
        <div class="section-title">ملخص الوثائق</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.totalDocuments || 0)}</div>
            <div class="stat-label">إجمالي الوثائق</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.newDocuments || 0)}</div>
            <div class="stat-label">وثائق جديدة</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.updatedDocuments || 0)}</div>
            <div class="stat-label">وثائق محدثة</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" style="color: #ef4444;">${this.formatNumber(data.deletedDocuments || 0)}</div>
            <div class="stat-label">وثائق محذوفة</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">الوثائق حسب الفئة</div>
        <div class="list-container">
          ${Object.entries(data.documentsByCategory || {}).map(([category, count]: [string, any]) => `
            <div class="list-item">
              <span class="list-label">${category}</span>
              <span class="list-value">${this.formatNumber(count)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">الوثائق حسب الحالة</div>
        <div class="list-container">
          <div class="list-item">
            <span class="list-label">نشطة</span>
            <span class="list-value">${this.formatNumber(data.documentsByStatus?.active || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">معلقة</span>
            <span class="list-value">${this.formatNumber(data.documentsByStatus?.pending || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">مؤرشفة</span>
            <span class="list-value">${this.formatNumber(data.documentsByStatus?.archived || 0)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private static formatSystemHealthData(data: any): string {
    const statusColor = data.systemStatus === 'healthy' ? '#22c55e' :
      data.systemStatus === 'warning' ? '#f59e0b' : '#ef4444';
    const statusText = data.systemStatus === 'healthy' ? 'سليم' :
      data.systemStatus === 'warning' ? 'تحذير' :
        data.systemStatus === 'critical' ? 'حرج' : 'غير محدد';

    return `
      <div class="content-section">
        <div class="section-title">حالة النظام</div>
        <div class="stat-card" style="border-right: 4px solid ${statusColor};">
          <div class="stat-number" style="color: ${statusColor};">${statusText}</div>
          <div class="stat-label">الحالة الحالية</div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">إحصائيات المستخدمين</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.totalUsers || 0)}</div>
            <div class="stat-label">إجمالي المستخدمين</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.activeUsers || 0)}</div>
            <div class="stat-label">المستخدمون النشطون</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" style="color: #ef4444;">${this.formatNumber(data.restrictedUsers || 0)}</div>
            <div class="stat-label">المستخدمون المقيدون</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">توزيع المستخدمين حسب الأدوار</div>
        <div class="list-container">
          <div class="list-item">
            <span class="list-label">المديرون</span>
            <span class="list-value">${this.formatNumber(data.userRoles?.admin || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">الأرشيفيون</span>
            <span class="list-value">${this.formatNumber(data.userRoles?.archivist || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">المشاهدون</span>
            <span class="list-value">${this.formatNumber(data.userRoles?.viewer || 0)}</span>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">إحصائيات الوثائق</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.documentStats?.totalDocuments || 0)}</div>
            <div class="stat-label">إجمالي الوثائق</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.documentStats?.activeDocuments || 0)}</div>
            <div class="stat-label">الوثائق النشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.documentStats?.pendingDocuments || 0)}</div>
            <div class="stat-label">الوثائق المعلقة</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.formatNumber(data.documentStats?.archivedDocuments || 0)}</div>
            <div class="stat-label">الوثائق المؤرشفة</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">اختبارات الأداء</div>
        <div class="list-container">
          ${Object.entries(data.performanceTests || {}).map(([testName, test]: [string, any]) => `
            <div class="list-item">
              <span class="list-label">${this.getTestName(testName)}</span>
              <span class="list-value" style="color: ${test.status === 'passed' ? 'green' : test.status === 'failed' ? 'red' : 'gray'}; background: transparent;">
                ${test.status === 'passed' ? 'نجح' : test.status === 'failed' ? 'فشل' : 'غير محدد'} 
                ${test.responseTime ? `(${test.responseTime}ms)` : ''}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${data.systemAlerts && data.systemAlerts.length > 0 ? `
      <div class="content-section">
        <div class="section-title">تنبيهات النظام</div>
        <div class="list-container">
          ${data.systemAlerts.map((alert: any) => `
            <div class="list-item" style="border-right: 4px solid ${alert.type === 'error' ? '#ef4444' : '#f59e0b'};">
              <span class="list-label">${alert.message}</span>
              <span class="list-value" style="background: transparent;">${alert.details}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    `;
  }

  private static getTestName(testName: string): string {
    const testNames: { [key: string]: string } = {
      'databaseConnection': 'اتصال قاعدة البيانات',
      'userQuery': 'استعلام المستخدمين',
      'documentQuery': 'استعلام الوثائق',
      'activityQuery': 'استعلام الأنشطة',
      'reportGenerationTime': 'وقت إنشاء التقرير'
    };
    return testNames[testName] || testName;
  }

  private static formatSecurityAuditData(data: any): string {
    return `
      <div class="content-section">
        <div class="section-title">ملخص الأمان</div>
        <div class="stats-grid" style="grid-template-columns: repeat(1, 1fr);">
          <div class="stat-card">
            <div class="stat-number" style="color: #ef4444;">${this.formatNumber(data.totalSecurityEvents || 0)}</div>
            <div class="stat-label">إجمالي أحداث الأمان</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-title">أحداث الأمان</div>
        <div class="list-container">
          <div class="list-item">
            <span class="list-label">تسجيلات الدخول</span>
            <span class="list-value">${this.formatNumber(data.loginEvents || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">تسجيلات الخروج</span>
            <span class="list-value">${this.formatNumber(data.logoutEvents || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">قيود المستخدمين</span>
            <span class="list-value">${this.formatNumber(data.userRestrictions || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">حذف المستخدمين</span>
            <span class="list-value">${this.formatNumber(data.userDeletions || 0)}</span>
          </div>
          <div class="list-item">
            <span class="list-label">تغيير الأدوار</span>
            <span class="list-value">${this.formatNumber(data.roleChanges || 0)}</span>
          </div>
        </div>
      </div>
    `;
  }
}
