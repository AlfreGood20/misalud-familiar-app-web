import { useState } from 'react';
import {
  ArrowPathIcon, AtSymbolIcon, ClipboardDocumentIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, PhoneIcon, ShieldCheckIcon, UserIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function generatePassword(length = 12) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (number) => PASSWORD_CHARS[number % PASSWORD_CHARS.length]).join('');
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back when clipboard permission or secure-context requirements block the Clipboard API.
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  let copied;
  try {
    textArea.focus();
    textArea.select();
    copied = document.execCommand('copy');
  } finally {
    textArea.remove();
  }

  if (!copied) throw new Error('El navegador no pudo copiar la contraseña.');
}

function Field({ label, icon, hint, optional, labelAction, children, ...props }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="label-text font-bold text-[#29425d]">
          {label} {optional && <span className="font-normal text-slate-400">(opcional)</span>}
        </span>
        {labelAction}
      </div>
      <label className="input input-bordered flex w-full items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:shadow-md focus-within:shadow-[#15919a]/10 focus-within:outline-[#15919a]">
        {icon && <span className="text-[#15919a] [&>svg]:size-5">{icon}</span>}
        <input className="grow" {...props} />
        {children}
      </label>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

function CaregiverForm({ value, editing = false, submitting, onChange, onSubmit, onCancel }) {
  const [showPassword, setShowPassword] = useState(false);
  const field = (name) => ({ name, value: value[name], onChange });
  const setValue = (name, newValue) => onChange({ target: { name, value: newValue } });

  const handlePhone = (event) => setValue('telefono', event.target.value.replace(/\D/g, '').slice(0, 20));

  const handleGenerate = () => {
    setValue('contrasena', generatePassword());
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    if (!value.contrasena) {
      toast.error('Genera o escribe una contraseña antes de copiarla.');
      return;
    }

    try {
      await copyTextToClipboard(value.contrasena);
      toast.success('Contraseña copiada al portapapeles.');
    } catch (error) {
      toast.error(error.message || 'No se pudo copiar la contraseña.');
      console.error('Error al copiar contraseña:', error);
    }
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="caregiver-form-title">
      <form onSubmit={onSubmit} className="modal-box max-h-[92vh] max-w-xl overflow-y-auto border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]"><ShieldCheckIcon className="size-6" /></span>
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Configuración</p>
                <h2 id="caregiver-form-title" className="text-xl font-bold text-[#19304a]">{editing ? 'Actualizar cuidador' : 'Nuevo cuidador'}</h2>
                <p className="text-xs text-slate-500">{editing ? 'Actualiza los datos del cuidador.' : 'Dale acceso a una persona de confianza.'}</p>
              </div>
            </div>
            <button type="button" onClick={onCancel} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar formulario"><XMarkIcon className="size-5" /></button>
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Datos personales</p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Nombre" icon={<UserIcon />} required autoFocus {...field('nombre')} />
            <Field label="Apellido paterno" {...field('apellidoPaterno')} />
            <Field label="Apellido materno" optional {...field('apellidoMaterno')} />
            <Field label="Teléfono" type="tel" icon={<PhoneIcon />} inputMode="numeric" maxLength="20" optional name="telefono" value={value.telefono} onChange={handlePhone} />
          </div>

          <p className="mb-2 mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Acceso al sistema</p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Correo electrónico" type="email" icon={<AtSymbolIcon />} required autoComplete="off" {...field('correo')} />
            </div>
            {!editing && (
              <div className="sm:col-span-2">
                <Field
                  label="Contraseña temporal"
                  type={showPassword ? 'text' : 'password'}
                  icon={<LockClosedIcon />}
                  minLength="8"
                  maxLength="72"
                  required
                  autoComplete="new-password"
                  hint="De 8 a 72 caracteres. Compártela con el cuidador de forma segura."
                  labelAction={(
                    <button type="button" onClick={handleCopyPassword} disabled={!value.contrasena || submitting} className="btn btn-ghost btn-xs min-h-0 px-1 text-[#126f7b] transition-all duration-200 active:scale-95" aria-label="Copiar contraseña temporal">
                      <ClipboardDocumentIcon className="size-4" aria-hidden="true" /> Copiar
                    </button>
                  )}
                  {...field('contrasena')}
                >
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="rounded-md p-1 text-[#126f7b] transition hover:bg-[#eaf8f5] active:scale-95" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>
                    {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </Field>
              </div>
            )}
          </div>
          {!editing && (
            <button type="button" onClick={handleGenerate} className="btn btn-outline btn-sm mb-4 transition-all duration-200 active:scale-95">
              <ArrowPathIcon className="size-4" /> Generar contraseña segura
            </button>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn btn-ghost transition-all duration-200 active:scale-95" disabled={submitting}>Cancelar</button>
            <button type="submit" disabled={submitting} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? (editing ? 'Guardando...' : 'Creando...') : (editing ? 'Guardar cambios' : 'Crear cuidador')}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onCancel} />
    </div>
  );
}

export default CaregiverForm;
