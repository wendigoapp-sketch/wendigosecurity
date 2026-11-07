'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/config/supabase';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const supabase = createClient();
    
    // 1. Intentamos loguear al usuario
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Buscamos el rol en la tabla de membresías (sin .single() para evitar el 406)
    const { data: membresias, error: errorMembresia } = await supabase
      .from('membresias')
      .select('rol')
      .eq('usuario_id', authData.user.id)
      .limit(1);

    if (errorMembresia) {
      setError('Error al consultar el rol: ' + errorMembresia.message);
      setLoading(false);
      return;
    }

    const rol = membresias && membresias.length > 0 ? membresias[0].rol : null;

    if (!rol) {
      setError('No se encontró una membresía activa para este usuario.');
      setLoading(false);
      return;
    }

    // 3. Redirigimos según el rol
    if (rol === 'administrador') {
      router.push('/panel-administrador');
    } else if (rol === 'guardia') {
      router.push('/panel-guardia');
    } else if (rol === 'residente') {
      router.push('/panel-residente');
    } else {
      setError('Rol no reconocido.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, backgroundColor: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShieldCheck size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, color: 'var(--foreground)' }}>WendigoSecurity</h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 8 }}>Ingresá con tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="wg-input"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="wg-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={{ color: 'var(--destructive)', fontSize: 13, textAlign: 'center' }}>{error}</p>}

          <button
            type="submit"
            className="wg-btn is-primary"
            style={{ marginTop: 8, justifyContent: 'center', padding: 12 }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ color: 'var(--muted-foreground)', fontSize: 13, textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}