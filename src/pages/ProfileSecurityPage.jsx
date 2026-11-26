import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import {
  changeCurrentPassword, getCurrentUser, updateCurrentUser,
} from '../services/authService';

const emptyPasswordForm = {
  contrasenaActual: '',
  nuevaContrasena: '',
  confirmarContrasena: '',
};

const profileFields = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'apellidoPaterno', label: 'Apellido paterno', required: true },
  { name: 'apellidoMaterno', label: 'Apellido materno' },
  { name: 'correo', label: 'Correo electrónico', type: 'email', required: true },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'tel',
    inputMode: 'numeric',
    pattern: '[0-9]{10}',
    minLength: 10,
    maxLength: 10,
    required: true,
  },
];

function formatDate(value) {
  if (!value) return 'Sin información';
  return new Date(value).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ProfileSecurityPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const passwordsMatch = !passwordForm.confirmarContrasena
    || passwordForm.nuevaContrasena === passwordForm.confirmarContrasena;
  const fieldClass = 'input input-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) setProfile(user);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error('No se pudieron cargar los datos de tu perfil.');
          console.error('Error al cargar el perfil autenticado:', error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    const updatedValue = name === 'telefono' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setProfile((current) => ({ ...current, [name]: updatedValue }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const togglePasswordVisibility = (name) => {
    setVisiblePasswords((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      profileFields.map(({ name }) => [name, String(profile[name] ?? '').trim()]),
    );

    setProfileSubmitting(true);
    try {
      await updateCurrentUser(payload);
      setProfile((current) => ({ ...current, ...payload }));
      toast.success('Datos personales actualizados.');
    } catch (error) {
      toast.error(error.message || 'No se pudieron actualizar los datos personales.');
      console.error('Error al actualizar datos personales:', error);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordsMatch) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passwordForm.nuevaContrasena.length < 9) {
      toast.error('La nueva contraseña debe tener más de 8 caracteres.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changeCurrentPassword({
        contrasenaActual: passwordForm.contrasenaActual,
        nuevaContrasena: passwordForm.nuevaContrasena,
      });
      toast.success('Contraseña actualizada.');
      setPasswordForm(emptyPasswordForm);
      setVisiblePasswords({});
    } catch (error) {
      toast.error(error.message || 'No se pudo cambiar la contraseña.');
      console.error('Error al cambiar la contraseña:', error);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-5xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <Link to="/configuracion" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#126f7b] transition hover:underline">
          <ArrowLeftIcon className="size-4" aria-hidden="true" /> Configuración
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#15919a]">Configuración de cuenta</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
            <UserCircleIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Perfil y seguridad
          </h1>
          <p className="mt-2 text-slate-500">Consulta y actualiza tu información personal y contraseña.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
        ) : !profile ? (
          <div className="alert alert-error bg-white">No fue posible cargar el perfil. Intenta volver a cargar la página.</div>
        ) : (
          <div className="space-y-6">
            <section className="card border border-slate-200 bg-white shadow-sm" aria-labelledby="profile-data-title">
              <form onSubmit={handleProfileSubmit} className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b]">
                    <UserCircleIcon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="profile-data-title" className="text-lg font-bold text-[#19304a]">Datos personales</h2>
                    <p className="text-sm text-slate-500">Edita la información asociada a tu cuenta.</p>
                  </div>
                </div>

                <div className="grid gap-x-4 sm:grid-cols-2">
                  {profileFields.map(({
                    name, label, type = 'text', required, inputMode, pattern, minLength, maxLength,
                  }) => (
                    <label key={name} className="mb-3 block">
                      <span className="label-text mb-1.5 block font-bold text-[#29425d]">{label}</span>
                      <input
                        type={type}
                        name={name}
                        value={profile[name] ?? ''}
                        onChange={handleProfileChange}
                        className={fieldClass}
                        autoComplete={name === 'correo' ? 'email' : name}
                        required={required}
                        inputMode={inputMode}
                        pattern={pattern}
                        minLength={minLength}
                        maxLength={maxLength}
                        disabled={profileSubmitting}
                      />
                      {name === 'telefono' && (
                        <span className="mt-1 block text-xs text-slate-400">Ingresa exactamente 10 dígitos.</span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rol</p>
                    <p className="mt-1 font-bold capitalize text-[#19304a]">{profile.rol?.replaceAll('_', ' ') || 'Sin información'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha de registro</p>
                    <p className="mt-1 font-bold text-[#19304a]">{formatDate(profile.fechaRegistro)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span />
                  <button type="submit" disabled={profileSubmitting} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:bg-[#0b5d69] active:scale-95 disabled:opacity-60">
                    {profileSubmitting && <span className="loading loading-spinner loading-sm" />}
                    {profileSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </section>

            <section className="card border border-slate-200 bg-white shadow-sm" aria-labelledby="password-title">
              <form onSubmit={handlePasswordSubmit} className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b]">
                    <ShieldCheckIcon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="password-title" className="text-lg font-bold text-[#19304a]">Cambiar contraseña</h2>
                    <p className="text-sm text-slate-500">Verifica tu contraseña actual y confirma la nueva.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ['contrasenaActual', 'Contraseña actual', 'current-password'],
                    ['nuevaContrasena', 'Nueva contraseña', 'new-password', 9],
                    ['confirmarContrasena', 'Confirmar nueva contraseña', 'new-password', 9],
                  ].map(([name, label, autoComplete, minLength]) => (
                    <label key={name} className="block">
                      <span className="label-text mb-1.5 block font-bold text-[#29425d]">{label}</span>
                      <span className="input input-bordered flex w-full items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:outline-[#15919a]">
                        <LockClosedIcon className="size-5 shrink-0 text-[#15919a]" aria-hidden="true" />
                        <input
                          type={visiblePasswords[name] ? 'text' : 'password'}
                          name={name}
                          value={passwordForm[name]}
                          onChange={handlePasswordChange}
                          className="grow"
                          autoComplete={autoComplete}
                          minLength={minLength}
                          required
                          disabled={passwordSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(name)}
                          disabled={passwordSubmitting}
                          className="inline-flex items-center gap-1 rounded-md px-1 text-xs font-bold text-[#126f7b] transition hover:bg-[#eaf8f5] active:scale-95"
                          aria-label={visiblePasswords[name] ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
                          aria-pressed={Boolean(visiblePasswords[name])}
                        >
                          {visiblePasswords[name]
                            ? <EyeSlashIcon className="size-4" aria-hidden="true" />
                            : <EyeIcon className="size-4" aria-hidden="true" />}
                          {visiblePasswords[name] ? 'Ocultar' : 'Ver'}
                        </button>
                      </span>
                    </label>
                  ))}
                  <p className="text-xs text-slate-500">La nueva contraseña debe tener al menos 9 caracteres. No hay un límite de 10 caracteres.</p>
                  {!passwordsMatch && (
                    <p className="text-sm font-medium text-red-600" role="alert">Las contraseñas nuevas no coinciden.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span />
                  <button
                    type="submit"
                    disabled={passwordSubmitting || !passwordForm.contrasenaActual || passwordForm.nuevaContrasena.length < 9 || !passwordForm.confirmarContrasena || !passwordsMatch}
                    className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:bg-[#0b5d69] active:scale-95 disabled:opacity-60"
                  >
                    {passwordSubmitting && <span className="loading loading-spinner loading-sm" />}
                    {passwordSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfileSecurityPage;
