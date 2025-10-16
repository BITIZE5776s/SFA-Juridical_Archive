import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SystemReport } from "@shared/schema";

export class PDFGenerator {
  private static formatNumber(num: number | string): string {
    // Convert to string first
    const numStr = num.toString();
    
    // Convert Arabic numerals to Western numerals
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
    // Handle mixed Arabic/English text properly
    // This function ensures proper text direction for mixed content
    return `<span class="mixed-text">${text}</span>`;
  }

  private static formatUserName(userName: string, userRole: string): string {
    // Format user names with proper mixed language support
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
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&display=swap');
          
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
            color: #333;
            background: white;
            padding: 20px;
            unicode-bidi: embed;
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
          }
          
          .mixed-text .rtl {
            direction: rtl;
            unicode-bidi: embed;
            display: inline-block;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header h2 {
            font-size: 18px;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .report-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .report-info h3 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-item:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 700;
            color: #374151;
          }
          
          .info-value {
            color: #6b7280;
          }
          
          .content-section {
            margin-bottom: 30px;
          }
          
          .content-section h3 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #6b7280;
            font-size: 14px;
          }
          
          .list-item {
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .list-item:last-child {
            border-bottom: none;
          }
          
          .list-label {
            font-weight: 600;
            color: #374151;
          }
          
          .list-value {
            color: #6b7280;
            background: #f8fafc;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .header {
              margin-bottom: 20px;
            }
            
            .content-section {
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.getReportTypeLabel(report.report_type)}</h1>
          <h2>${report.title}</h2>
        </div>
        
        <div class="report-info">
          <h3>معلومات التقرير</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء:</span>
              <span class="info-value">${this.formatDate(report.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">وقت الإنشاء:</span>
              <span class="info-value">${this.formatTime(report.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">نوع التقرير:</span>
              <span class="info-value">${this.getReportTypeLabel(report.report_type)}</span>
            </div>
            ${report.description ? `
            <div class="info-item">
              <span class="info-label">الوصف:</span>
              <span class="info-value">${report.description}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${reportData}
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام الأرشيف القضائي</p>
          <p>تاريخ الطباعة: ${this.formatDate(new Date())} - ${this.formatTime(new Date())}</p>
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
      // Create HTML content
      const htmlContent = this.createReportHTML(report);
      
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.fontSize = '12px';
      document.body.appendChild(tempContainer);

      // Wait for fonts to load
      await document.fonts.ready;

      // Convert HTML to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: tempContainer.scrollHeight
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

    // Download the PDF
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
        <h3>ملخص النشاط</h3>
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
        <h3>توزيع الأنشطة</h3>
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
      
      <div class="content-section">
        <h3>أكثر المستخدمين نشاطاً</h3>
        ${(data.userStats || []).slice(0, 5).map((user: any, index: number) => `
          <div class="list-item">
            <span class="list-label">${this.formatNumber(index + 1)}. ${this.formatUserName(user.userName || 'غير محدد', user.userRole || 'غير محدد')}</span>
            <span class="list-value">${this.formatNumber(user.activityCount || 0)} نشاط</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private static formatDocumentStatsData(data: any): string {
    return `
      <div class="content-section">
        <h3>ملخص الوثائق</h3>
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
            <div class="stat-number">${this.formatNumber(data.deletedDocuments || 0)}</div>
            <div class="stat-label">وثائق محذوفة</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>الوثائق حسب الفئة</h3>
        ${Object.entries(data.documentsByCategory || {}).map(([category, count]: [string, any]) => `
          <div class="list-item">
            <span class="list-label">${category}</span>
            <span class="list-value">${this.formatNumber(count)}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="content-section">
        <h3>الوثائق حسب الحالة</h3>
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
        <h3>حالة النظام</h3>
        <div class="stat-card" style="border-left: 4px solid ${statusColor};">
          <div class="stat-number" style="color: ${statusColor};">${statusText}</div>
          <div class="stat-label">الحالة الحالية</div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>إحصائيات المستخدمين</h3>
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
            <div class="stat-number">${this.formatNumber(data.restrictedUsers || 0)}</div>
            <div class="stat-label">المستخدمون المقيدون</div>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>توزيع المستخدمين حسب الأدوار</h3>
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
      
      <div class="content-section">
        <h3>إحصائيات الوثائق</h3>
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
        <h3>اختبارات الأداء</h3>
        ${Object.entries(data.performanceTests || {}).map(([testName, test]: [string, any]) => `
          <div class="list-item">
            <span class="list-label">${this.getTestName(testName)}</span>
            <span class="list-value" style="color: ${test.status === 'passed' ? '#22c55e' : test.status === 'failed' ? '#ef4444' : '#6b7280'};">
              ${test.status === 'passed' ? 'نجح' : test.status === 'failed' ? 'فشل' : 'غير محدد'} 
              ${test.responseTime ? `(${test.responseTime}ms)` : ''}
            </span>
          </div>
        `).join('')}
      </div>
      
      ${data.systemAlerts && data.systemAlerts.length > 0 ? `
      <div class="content-section">
        <h3>تنبيهات النظام</h3>
        ${data.systemAlerts.map((alert: any) => `
          <div class="list-item" style="border-left: 4px solid ${alert.type === 'error' ? '#ef4444' : '#f59e0b'};">
            <span class="list-label">${alert.message}</span>
            <span class="list-value">${alert.details}</span>
          </div>
        `).join('')}
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
        <h3>ملخص الأمان</h3>
        <div class="stat-card">
          <div class="stat-number">${this.formatNumber(data.totalSecurityEvents || 0)}</div>
          <div class="stat-label">إجمالي أحداث الأمان</div>
        </div>
      </div>
      
      <div class="content-section">
        <h3>أحداث الأمان</h3>
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
    `;
  }
}
