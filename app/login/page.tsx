'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '../../lib/config/supabase';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 1. Autenticamos al usuario
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const usuarioId = authData.user.id;

      // 2. Primero verificamos si es administrador de una empresa
      const { data: empresaMembresias, error: errorEmpresa } =
        await supabase
          .from('empresa_membresias')
          .select('rol')
          .eq('usuario_id', usuarioId)
          .eq('estado', 'activo');

      if (errorEmpresa) {
        setError('Error al consultar empresa: ' + errorEmpresa.message);
        setLoading(false);
        return;
      }

      const rolesEmpresa = [
        ...new Set(
          (empresaMembresias ?? [])
            .map((m) => m.rol)
            .filter(Boolean)
        ),
      ];

      // 3. Si es administrador, entra al panel administrativo
      if (rolesEmpresa.includes('admin')) {
        window.location.href = '/panel-administrador'; // <-- FORZA RECARGA
        return;
      }

      // 4. Si no es administrador, buscamos su rol en el condominio
      const { data: membresias, error: errorMembresia } =
        await supabase
          .from('membresias')
          .select('rol')
          .eq('usuario_id', usuarioId)
          .eq('estado', 'activo');

      if (errorMembresia) {
        setError('Error al consultar membresías: ' + errorMembresia.message);
        setLoading(false);
        return;
      }

      const rolesCondominio = [
        ...new Set(
          (membresias ?? [])
            .map((m) => m.rol)
            .filter(Boolean)
        ),
      ];

      // 5. Verificamos que tenga una membresía válida
      if (rolesCondominio.length === 0) {
        await supabase.auth.signOut();
        setError('No se encontró una membresía activa para este usuario.');
        setLoading(false);
        return;
      }

      // 6. Si tiene más de un rol diferente, evitamos una redirección incorrecta
      if (rolesCondominio.length > 1) {
        setError(
          'Este usuario tiene varios roles asignados. Contactá al administrador.'
        );
        setLoading(false);
        return;
      }

      const rol = rolesCondominio[0];

      // 7. Redirigimos según el rol (RECARGA COMPLETA)
      if (rol === 'guardia') {
        window.location.href = '/panel-guardia'; 
      } else if (rol === 'residente') {
        window.location.href = '/panel-residente';
      } else {
        setError('Rol no reconocido: ' + rol);
        setLoading(false);
      }

    } catch (err) {
      console.error('Error en el inicio de sesión:', err);
      setError('Ocurrió un error inesperado al iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 32,
          backgroundColor: 'var(--card)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShieldCheck
            size={48}
            style={{ color: 'var(--primary)', margin: '0 auto' }}
          />

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 16,
              color: 'var(--foreground)',
            }}
          >
            WendigoSecurity
          </h1>

          <p
            style={{
              color: 'var(--muted-foreground)',
              marginTop: 8,
            }}
          >
            Ingresá con tu cuenta
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--foreground)',
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="wg-input"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--foreground)',
              }}
            >
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="wg-input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p
              style={{
                color: 'var(--destructive)',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="wg-btn is-primary"
            style={{
              marginTop: 8,
              justifyContent: 'center',
              padding: 12,
            }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            href="/"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}