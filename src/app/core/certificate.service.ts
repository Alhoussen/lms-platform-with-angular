import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

export interface Certificate {
    id: number;
    userId: number;
    courseId: number;
    courseName: string;
    studentName: string;
    completionDate: Date;
    score: number;
}

@Injectable({ providedIn: 'root' })
export class CertificateService {

    /**
     * Generate a PDF certificate for a completed course
     */
    generateCertificate(certificate: Certificate): void {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Background color
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Border
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner border
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Title
        doc.setFontSize(40);
        doc.setTextColor(99, 102, 241);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICAT DE RÉUSSITE', pageWidth / 2, 40, { align: 'center' });

        // Subtitle
        doc.setFontSize(16);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Ce certificat atteste que', pageWidth / 2, 60, { align: 'center' });

        // Student name
        doc.setFontSize(32);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(certificate.studentName, pageWidth / 2, 80, { align: 'center' });

        // Course completion text
        doc.setFontSize(16);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('a complété avec succès le cours', pageWidth / 2, 95, { align: 'center' });

        // Course name
        doc.setFontSize(24);
        doc.setTextColor(99, 102, 241);
        doc.setFont('helvetica', 'bold');
        doc.text(certificate.courseName, pageWidth / 2, 115, { align: 'center' });

        // Score
        if (certificate.score >= 0) {
            doc.setFontSize(18);
            doc.setTextColor(16, 185, 129);
            doc.setFont('helvetica', 'bold');
            doc.text(`Score: ${certificate.score}%`, pageWidth / 2, 130, { align: 'center' });
        }

        // Date
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        const dateStr = new Date(certificate.completionDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Délivré le ${dateStr}`, pageWidth / 2, 150, { align: 'center' });

        // Platform name
        doc.setFontSize(12);
        doc.setTextColor(148, 163, 184);
        doc.text('LMS Platform - Plateforme d\'apprentissage en ligne', pageWidth / 2, 170, { align: 'center' });

        // Certificate ID
        doc.setFontSize(10);
        doc.setTextColor(203, 213, 225);
        doc.text(`ID: CERT-${certificate.id}-${certificate.userId}-${certificate.courseId}`, pageWidth / 2, 185, { align: 'center' });

        // Decorative elements
        this.addDecorativeElements(doc, pageWidth, pageHeight);

        // Save the PDF
        const fileName = `certificat-${certificate.courseName.replace(/\s+/g, '-').toLowerCase()}-${certificate.studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        doc.save(fileName);
    }

    /**
     * Add decorative elements to the certificate
     */
    private addDecorativeElements(doc: jsPDF, pageWidth: number, pageHeight: number): void {
        // Top left corner decoration
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(1);
        doc.line(20, 20, 40, 20);
        doc.line(20, 20, 20, 40);

        // Top right corner decoration
        doc.line(pageWidth - 40, 20, pageWidth - 20, 20);
        doc.line(pageWidth - 20, 20, pageWidth - 20, 40);

        // Bottom left corner decoration
        doc.line(20, pageHeight - 40, 20, pageHeight - 20);
        doc.line(20, pageHeight - 20, 40, pageHeight - 20);

        // Bottom right corner decoration
        doc.line(pageWidth - 20, pageHeight - 40, pageWidth - 20, pageHeight - 20);
        doc.line(pageWidth - 40, pageHeight - 20, pageWidth - 20, pageHeight - 20);

        // Add some stars/badges
        doc.setFillColor(255, 215, 0);
        doc.circle(30, pageHeight / 2, 3, 'F');
        doc.circle(pageWidth - 30, pageHeight / 2, 3, 'F');
    }

    /**
     * Check if a user is eligible for a certificate
     * (All lessons completed and quiz passed with at least 70%)
     */
    isEligibleForCertificate(completedLessons: number, totalLessons: number, quizScore?: number): boolean {
        const allLessonsCompleted = completedLessons === totalLessons && totalLessons > 0;
        const quizPassed = quizScore === undefined || quizScore >= 70;
        return allLessonsCompleted && quizPassed;
    }
}
