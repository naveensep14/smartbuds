'use client';

import { Test, Question } from '@/types';
import { Printer, Download } from 'lucide-react';

interface PrintableTestProps {
  test: Test;
  showAnswers?: boolean;
}

export default function PrintableTest({ test, showAnswers = false }: PrintableTestProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('printable-content');
      if (content) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${test.title} - ${showAnswers ? 'Answer Key' : 'Test'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .test-info { margin-bottom: 20px; }
                .question { margin-bottom: 25px; page-break-inside: avoid; }
                .question-number { font-weight: bold; margin-bottom: 10px; }
                .options { margin-left: 20px; }
                .option { margin-bottom: 5px; }
                .correct-answer { background-color: #d4edda; padding: 2px 5px; border-radius: 3px; }
                .answer-key { background-color: #f8f9fa; padding: 15px; margin-top: 20px; border-radius: 5px; }
                @media print {
                  .no-print { display: none; }
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Print Controls */}
      <div className="no-print flex justify-end space-x-3 mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Printable Content */}
      <div id="printable-content" className="printable-content">
        {/* Header */}
        <div className="header">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{test.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{test.description}</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span><strong>Subject:</strong> {test.subject}</span>
            <span><strong>Grade:</strong> {test.grade}</span>
            <span><strong>Duration:</strong> {test.duration} minutes</span>
          </div>
          {showAnswers && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 font-semibold">ANSWER KEY</p>
            </div>
          )}
        </div>

        {/* Student Info Section */}
        {!showAnswers && (
          <div className="test-info border-b border-gray-200 pb-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name:</label>
                <div className="border-b border-gray-300 h-8"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                <div className="border-b border-gray-300 h-8"></div>
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="questions">
          {test.questions.map((question: Question, index: number) => (
            <div key={question.id} className="question">
              <div className="question-number">
                Question {index + 1}: {question.text}
              </div>
              <div className="options">
                {question.options.map((option: string, optionIndex: number) => (
                  <div key={optionIndex} className="option">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name={`question-${index}`}
                        className="mr-2"
                        disabled={showAnswers}
                      />
                      <span className={`${showAnswers && optionIndex === question.correctAnswer ? 'correct-answer' : ''}`}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                        {showAnswers && optionIndex === question.correctAnswer && (
                          <span className="ml-2 text-green-600 font-semibold">✓ CORRECT</span>
                        )}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key with Detailed Explanations */}
        {showAnswers && (
          <div className="answer-key mt-8 page-break-before">
            <h3 className="text-xl font-bold mb-6 text-orange-600 border-b-2 border-orange-600 pb-2">
              Answer Key with Explanations
            </h3>
            <div className="space-y-6">
              {test.questions.map((question: Question, index: number) => (
                <div key={question.id} className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-start mb-2">
                    <span className="font-bold text-lg text-gray-800">Q{index + 1}:</span>
                    <span className="ml-2 font-bold text-lg text-green-600">
                      {String.fromCharCode(65 + question.correctAnswer)}
                    </span>
                    <span className="ml-2 text-gray-600">
                      ({question.options[question.correctAnswer]})
                    </span>
                  </div>
                  {question.explanation && (
                    <div className="mt-2 pl-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>SuccessBuds Educational Platform</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
