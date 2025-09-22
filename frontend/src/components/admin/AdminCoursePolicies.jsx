import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminCoursePolicies = ({
  onClose,
  onSave,
  onSuccess
}) => {
  const [policies, setPolicies] = useState({
    enrollment: {
      maxStudentsPerCourse: 50,
      maxWaitlistSize: 25,
      allowLateEnrollment: false,
      lateEnrollmentDeadline: 7,
      requirePrerequisites: true,
      autoEnrollmentConfirmation: true,
      enrollmentFee: 0,
      refundPolicy: 'strict'
    },
    completion: {
      minCompletionPercentage: 80,
      maxTimeToComplete: 180,
      allowExtensions: true,
      maxExtensions: 2,
      extensionDuration: 30,
      requireFinalAssessment: true,
      passingGrade: 70,
      allowRetakes: true,
      maxRetakes: 3
    },
    certification: {
      autoGenerateCertificate: true,
      certificateTemplate: 'default',
      requireVerification: false,
      verificationMethod: 'email',
      certificateExpiry: 0,
      allowDigitalSignature: true,
      shareWithEmployers: false,
      blockchainVerification: false
    },
    access: {
      allowGuestAccess: false,
      requireLogin: true,
      sessionTimeout: 60,
      maxConcurrentSessions: 3,
      ipRestrictions: false,
      allowedIPs: [],
      geographicRestrictions: false,
      allowedCountries: []
    },
    content: {
      allowDownload: true,
      downloadLimit: 5,
      allowSharing: false,
      watermarkContent: true,
      contentExpiry: 365,
      allowOfflineAccess: false,
      trackProgress: true,
      adaptiveLearning: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('enrollment');
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load existing policies on component mount
  useEffect(() => {
    loadExistingPolicies();
  }, []);

  const loadExistingPolicies = async () => {
    try {
      // Simulate API call - replace with actual service call
      const existingPolicies = {
        enrollment: {
          maxStudentsPerCourse: 100,
          maxWaitlistSize: 20,
          allowLateEnrollment: true,
          lateEnrollmentDeadline: 14,
          requirePrerequisites: true,
          autoEnrollmentConfirmation: true,
          enrollmentFee: 25,
          refundPolicy: 'flexible'
        },
        completion: {
          minCompletionPercentage: 75,
          maxTimeToComplete: 120,
          allowExtensions: true,
          maxExtensions: 3,
          extensionDuration: 15,
          requireFinalAssessment: true,
          passingGrade: 60,
          allowRetakes: true,
          maxRetakes: 2
        },
        certification: {
          autoGenerateCertificate: true,
          certificateTemplate: 'modern',
          requireVerification: true,
          verificationMethod: 'email',
          certificateExpiry: 730,
          allowDigitalSignature: true,
          shareWithEmployers: false,
          blockchainVerification: false
        },
        access: {
          allowGuestAccess: false,
          requireLogin: true,
          sessionTimeout: 120,
          maxConcurrentSessions: 2,
          ipRestrictions: false,
          allowedIPs: [],
          geographicRestrictions: false,
          allowedCountries: []
        },
        content: {
          allowDownload: true,
          downloadLimit: 10,
          allowSharing: false,
          watermarkContent: true,
          contentExpiry: 180,
          allowOfflineAccess: true,
          trackProgress: true,
          adaptiveLearning: false
        }
      };

      setPolicies(existingPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
    }
  };

  const handlePolicyChange = (category, field, value) => {
    setPolicies(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));

    // Clear validation error for this field
    if (validationErrors[`${category}.${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${category}.${field}`];
        return newErrors;
      });
    }
  };

  const validatePolicies = () => {
    const errors = {};

    // Enrollment validations
    if (policies.enrollment.maxStudentsPerCourse < 1) {
      errors['enrollment.maxStudentsPerCourse'] = 'Debe permitir al menos 1 estudiante';
    }
    if (policies.enrollment.maxWaitlistSize < 0) {
      errors['enrollment.maxWaitlistSize'] = 'No puede ser negativo';
    }
    if (policies.enrollment.lateEnrollmentDeadline < 0) {
      errors['enrollment.lateEnrollmentDeadline'] = 'No puede ser negativo';
    }
    if (policies.enrollment.enrollmentFee < 0) {
      errors['enrollment.enrollmentFee'] = 'No puede ser negativo';
    }

    // Completion validations
    if (policies.completion.minCompletionPercentage < 0 || policies.completion.minCompletionPercentage > 100) {
      errors['completion.minCompletionPercentage'] = 'Debe estar entre 0 y 100';
    }
    if (policies.completion.maxTimeToComplete < 1) {
      errors['completion.maxTimeToComplete'] = 'Debe ser al menos 1 día';
    }
    if (policies.completion.passingGrade < 0 || policies.completion.passingGrade > 100) {
      errors['completion.passingGrade'] = 'Debe estar entre 0 y 100';
    }
    if (policies.completion.maxRetakes < 0) {
      errors['completion.maxRetakes'] = 'No puede ser negativo';
    }

    // Access validations
    if (policies.access.sessionTimeout < 5) {
      errors['access.sessionTimeout'] = 'Debe ser al menos 5 minutos';
    }
    if (policies.access.maxConcurrentSessions < 1) {
      errors['access.maxConcurrentSessions'] = 'Debe permitir al menos 1 sesión';
    }

    // Content validations
    if (policies.content.downloadLimit < 0) {
      errors['content.downloadLimit'] = 'No puede ser negativo';
    }
    if (policies.content.contentExpiry < 0) {
      errors['content.contentExpiry'] = 'No puede ser negativo';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validatePolicies()) {
      alert('Por favor corrige los errores de validación antes de guardar');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        success: true,
        message: 'Políticas actualizadas exitosamente',
        timestamp: new Date().toISOString(),
        policies: policies
      };

      if (onSave) {
        onSave(policies);
      }

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Error saving policies:', error);
      alert('Error al guardar las políticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todas las políticas a los valores por defecto?')) {
      loadExistingPolicies();
      setValidationErrors({});
    }
  };

  const getPolicyPreview = () => {
    return {
      enrollment: {
        title: 'Políticas de Inscripción',
        items: [
          `Máximo de estudiantes por curso: ${policies.enrollment.maxStudentsPerCourse}`,
          `Tamaño máximo de lista de espera: ${policies.enrollment.maxWaitlistSize}`,
          `Inscripción tardía permitida: ${policies.enrollment.allowLateEnrollment ? 'Sí' : 'No'}`,
          `Plazo para inscripción tardía: ${policies.enrollment.lateEnrollmentDeadline} días`,
          `Requiere prerequisitos: ${policies.enrollment.requirePrerequisites ? 'Sí' : 'No'}`,
          `Costo de inscripción: $${policies.enrollment.enrollmentFee}`,
          `Política de reembolso: ${policies.enrollment.refundPolicy === 'strict' ? 'Estricta' : 'Flexible'}`
        ]
      },
      completion: {
        title: 'Políticas de Completitud',
        items: [
          `Porcentaje mínimo de completitud: ${policies.completion.minCompletionPercentage}%`,
          `Tiempo máximo para completar: ${policies.completion.maxTimeToComplete} días`,
          `Extensiones permitidas: ${policies.completion.allowExtensions ? 'Sí' : 'No'}`,
          `Máximo de extensiones: ${policies.completion.maxExtensions}`,
          `Duración de extensión: ${policies.completion.extensionDuration} días`,
          `Requiere evaluación final: ${policies.completion.requireFinalAssessment ? 'Sí' : 'No'}`,
          `Calificación aprobatoria: ${policies.completion.passingGrade}%`,
          `Reintentos permitidos: ${policies.completion.allowRetakes ? policies.completion.maxRetakes : 'No'}`
        ]
      },
      certification: {
        title: 'Políticas de Certificación',
        items: [
          `Generación automática de certificado: ${policies.certification.autoGenerateCertificate ? 'Sí' : 'No'}`,
          `Plantilla de certificado: ${policies.certification.certificateTemplate}`,
          `Requiere verificación: ${policies.certification.requireVerification ? 'Sí' : 'No'}`,
          `Método de verificación: ${policies.certification.verificationMethod}`,
          `Expiración del certificado: ${policies.certification.certificateExpiry > 0 ? policies.certification.certificateExpiry + ' días' : 'Nunca'}`,
          `Firma digital permitida: ${policies.certification.allowDigitalSignature ? 'Sí' : 'No'}`,
          `Compartir con empleadores: ${policies.certification.shareWithEmployers ? 'Sí' : 'No'}`,
          `Verificación blockchain: ${policies.certification.blockchainVerification ? 'Sí' : 'No'}`
        ]
      },
      access: {
        title: 'Políticas de Acceso',
        items: [
          `Acceso de invitados: ${policies.access.allowGuestAccess ? 'Permitido' : 'No permitido'}`,
          `Requiere login: ${policies.access.requireLogin ? 'Sí' : 'No'}`,
          `Tiempo de espera de sesión: ${policies.access.sessionTimeout} minutos`,
          `Máximo de sesiones concurrentes: ${policies.access.maxConcurrentSessions}`,
          `Restricciones IP: ${policies.access.ipRestrictions ? 'Activas' : 'Inactivas'}`,
          `Restricciones geográficas: ${policies.access.geographicRestrictions ? 'Activas' : 'Inactivas'}`
        ]
      },
      content: {
        title: 'Políticas de Contenido',
        items: [
          `Descarga permitida: ${policies.content.allowDownload ? 'Sí' : 'No'}`,
          `Límite de descargas: ${policies.content.downloadLimit}`,
          `Compartir contenido: ${policies.content.allowSharing ? 'Permitido' : 'No permitido'}`,
          `Marca de agua en contenido: ${policies.content.watermarkContent ? 'Sí' : 'No'}`,
          `Expiración de contenido: ${policies.content.contentExpiry} días`,
          `Acceso offline: ${policies.content.allowOfflineAccess ? 'Permitido' : 'No permitido'}`,
          `Seguimiento de progreso: ${policies.content.trackProgress ? 'Activo' : 'Inactivo'}`,
          `Aprendizaje adaptativo: ${policies.content.adaptiveLearning ? 'Activo' : 'Inactivo'}`
        ]
      }
    };
  };

  const tabs = [
    { id: 'enrollment', label: 'Inscripción', icon: '👥' },
    { id: 'completion', label: 'Completitud', icon: '✅' },
    { id: 'certification', label: 'Certificación', icon: '🏆' },
    { id: 'access', label: 'Acceso', icon: '🔐' },
    { id: 'content', label: 'Contenido', icon: '📚' }
  ];

  const preview = getPolicyPreview();

  // Enrollment Policies Component
  const EnrollmentPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de estudiantes por curso
          </label>
          <input
            type="number"
            min="1"
            value={policies.enrollment.maxStudentsPerCourse}
            onChange={(e) => handlePolicyChange('enrollment', 'maxStudentsPerCourse', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['enrollment.maxStudentsPerCourse'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['enrollment.maxStudentsPerCourse']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño máximo de lista de espera
          </label>
          <input
            type="number"
            min="0"
            value={policies.enrollment.maxWaitlistSize}
            onChange={(e) => handlePolicyChange('enrollment', 'maxWaitlistSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['enrollment.maxWaitlistSize'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['enrollment.maxWaitlistSize']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permitir inscripción tardía
          </label>
          <select
            value={policies.enrollment.allowLateEnrollment}
            onChange={(e) => handlePolicyChange('enrollment', 'allowLateEnrollment', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plazo para inscripción tardía (días)
          </label>
          <input
            type="number"
            min="0"
            value={policies.enrollment.lateEnrollmentDeadline}
            onChange={(e) => handlePolicyChange('enrollment', 'lateEnrollmentDeadline', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['enrollment.lateEnrollmentDeadline'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['enrollment.lateEnrollmentDeadline']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Costo de inscripción ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={policies.enrollment.enrollmentFee}
            onChange={(e) => handlePolicyChange('enrollment', 'enrollmentFee', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['enrollment.enrollmentFee'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['enrollment.enrollmentFee']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Política de reembolso
          </label>
          <select
            value={policies.enrollment.refundPolicy}
            onChange={(e) => handlePolicyChange('enrollment', 'refundPolicy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="strict">Estricta</option>
            <option value="flexible">Flexible</option>
            <option value="none">Sin reembolso</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.enrollment.requirePrerequisites}
            onChange={(e) => handlePolicyChange('enrollment', 'requirePrerequisites', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Requerir prerequisitos para inscripción</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.enrollment.autoEnrollmentConfirmation}
            onChange={(e) => handlePolicyChange('enrollment', 'autoEnrollmentConfirmation', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Confirmación automática de inscripción</span>
        </label>
      </div>
    </div>
  );

  // Completion Policies Component
  const CompletionPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porcentaje mínimo de completitud (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={policies.completion.minCompletionPercentage}
            onChange={(e) => handlePolicyChange('completion', 'minCompletionPercentage', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['completion.minCompletionPercentage'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['completion.minCompletionPercentage']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo máximo para completar (días)
          </label>
          <input
            type="number"
            min="1"
            value={policies.completion.maxTimeToComplete}
            onChange={(e) => handlePolicyChange('completion', 'maxTimeToComplete', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['completion.maxTimeToComplete'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['completion.maxTimeToComplete']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación aprobatoria (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={policies.completion.passingGrade}
            onChange={(e) => handlePolicyChange('completion', 'passingGrade', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['completion.passingGrade'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['completion.passingGrade']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de reintentos
          </label>
          <input
            type="number"
            min="0"
            value={policies.completion.maxRetakes}
            onChange={(e) => handlePolicyChange('completion', 'maxRetakes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['completion.maxRetakes'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['completion.maxRetakes']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de extensiones
          </label>
          <input
            type="number"
            min="0"
            value={policies.completion.maxExtensions}
            onChange={(e) => handlePolicyChange('completion', 'maxExtensions', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración de extensión (días)
          </label>
          <input
            type="number"
            min="1"
            value={policies.completion.extensionDuration}
            onChange={(e) => handlePolicyChange('completion', 'extensionDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.completion.allowExtensions}
            onChange={(e) => handlePolicyChange('completion', 'allowExtensions', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir extensiones de tiempo</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.completion.requireFinalAssessment}
            onChange={(e) => handlePolicyChange('completion', 'requireFinalAssessment', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Requerir evaluación final</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.completion.allowRetakes}
            onChange={(e) => handlePolicyChange('completion', 'allowRetakes', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir reintentos de evaluación</span>
        </label>
      </div>
    </div>
  );

  // Certification Policies Component
  const CertificationPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla de certificado
          </label>
          <select
            value={policies.certification.certificateTemplate}
            onChange={(e) => handlePolicyChange('certification', 'certificateTemplate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="default">Por defecto</option>
            <option value="modern">Moderno</option>
            <option value="classic">Clásico</option>
            <option value="minimal">Minimalista</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de verificación
          </label>
          <select
            value={policies.certification.verificationMethod}
            onChange={(e) => handlePolicyChange('certification', 'verificationMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="manual">Manual</option>
            <option value="none">Sin verificación</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiración del certificado (días)
          </label>
          <input
            type="number"
            min="0"
            value={policies.certification.certificateExpiry}
            onChange={(e) => handlePolicyChange('certification', 'certificateExpiry', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500">0 = nunca expira</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.certification.autoGenerateCertificate}
            onChange={(e) => handlePolicyChange('certification', 'autoGenerateCertificate', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Generar certificado automáticamente</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.certification.requireVerification}
            onChange={(e) => handlePolicyChange('certification', 'requireVerification', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Requerir verificación de certificado</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.certification.allowDigitalSignature}
            onChange={(e) => handlePolicyChange('certification', 'allowDigitalSignature', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir firma digital</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.certification.shareWithEmployers}
            onChange={(e) => handlePolicyChange('certification', 'shareWithEmployers', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Compartir con empleadores</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.certification.blockchainVerification}
            onChange={(e) => handlePolicyChange('certification', 'blockchainVerification', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Verificación blockchain</span>
        </label>
      </div>
    </div>
  );

  // Access Policies Component
  const AccessPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo de espera de sesión (minutos)
          </label>
          <input
            type="number"
            min="5"
            value={policies.access.sessionTimeout}
            onChange={(e) => handlePolicyChange('access', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['access.sessionTimeout'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['access.sessionTimeout']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de sesiones concurrentes
          </label>
          <input
            type="number"
            min="1"
            value={policies.access.maxConcurrentSessions}
            onChange={(e) => handlePolicyChange('access', 'maxConcurrentSessions', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['access.maxConcurrentSessions'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['access.maxConcurrentSessions']}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.access.allowGuestAccess}
            onChange={(e) => handlePolicyChange('access', 'allowGuestAccess', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir acceso de invitados</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.access.requireLogin}
            onChange={(e) => handlePolicyChange('access', 'requireLogin', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Requerir inicio de sesión</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.access.ipRestrictions}
            onChange={(e) => handlePolicyChange('access', 'ipRestrictions', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Restricciones por IP</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.access.geographicRestrictions}
            onChange={(e) => handlePolicyChange('access', 'geographicRestrictions', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Restricciones geográficas</span>
        </label>
      </div>
    </div>
  );

  // Content Policies Component
  const ContentPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Límite de descargas
          </label>
          <input
            type="number"
            min="0"
            value={policies.content.downloadLimit}
            onChange={(e) => handlePolicyChange('content', 'downloadLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['content.downloadLimit'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['content.downloadLimit']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiración de contenido (días)
          </label>
          <input
            type="number"
            min="0"
            value={policies.content.contentExpiry}
            onChange={(e) => handlePolicyChange('content', 'contentExpiry', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {validationErrors['content.contentExpiry'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['content.contentExpiry']}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">0 = nunca expira</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.allowDownload}
            onChange={(e) => handlePolicyChange('content', 'allowDownload', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir descarga de contenido</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.allowSharing}
            onChange={(e) => handlePolicyChange('content', 'allowSharing', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir compartir contenido</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.watermarkContent}
            onChange={(e) => handlePolicyChange('content', 'watermarkContent', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Aplicar marca de agua al contenido</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.allowOfflineAccess}
            onChange={(e) => handlePolicyChange('content', 'allowOfflineAccess', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Permitir acceso offline</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.trackProgress}
            onChange={(e) => handlePolicyChange('content', 'trackProgress', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Seguimiento de progreso</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={policies.content.adaptiveLearning}
            onChange={(e) => handlePolicyChange('content', 'adaptiveLearning', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Aprendizaje adaptativo</span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'enrollment':
        return <EnrollmentPolicies />;
      case 'completion':
        return <CompletionPolicies />;
      case 'certification':
        return <CertificationPolicies />;
      case 'access':
        return <AccessPolicies />;
      case 'content':
        return <ContentPolicies />;
      default:
        return <EnrollmentPolicies />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Configuración de Políticas del Sistema
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {renderTabContent()}
            </div>

            {/* Preview Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {showPreview ? 'Ocultar' : 'Mostrar'} vista previa de políticas
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Vista Previa de Políticas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(preview).map(([key, section]) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h5 className="font-medium text-gray-900 mb-3">{section.title}</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {section.items.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={loading}
              >
                Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Políticas'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCoursePolicies;