import Link from 'next/link';
import { Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--font-sans)' }}>
      
      {/* HEADER LOGO Y TITULO */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', marginBottom: '20px', width: '100%' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', flexShrink: 0 }}>
          <ShieldCheck size={42} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* clamp achica el texto en celus y lo agranda en PC */}
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 700, color: 'var(--foreground)', margin: 0, lineHeight: 1.1 }}>
            WendigoSecurity
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'clamp(13px, 3vw, 16px)', marginTop: '6px', textAlign: 'center', maxWidth: '400px' }}>
            Centro de control inteligente para condominios
          </p>
        </div>
      </div>
      
      <div style={{ width: '100%', maxWidth: '900px', height: '1px', backgroundColor: 'var(--border)', margin: '20px 0' }} />

      <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 500, marginBottom: '30px', color: 'var(--foreground)', textAlign: 'center' }}>Seleccioná tu tipo de acceso</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px' }}>
        
        {/* Admin */}
        <Link href="/panel-administrador" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--secondary)', borderRadius: '50%', marginBottom: '24px' }}>
              <ShieldAlert size={36} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>Administrador</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>Gestión de condominios, guardias, residentes, turnos y reportes globales.</p>
            <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '14px' }}>Ingresar al panel →</span>
          </div>
        </Link>

        {/* Guardia */}
        <Link href="/panel-guardia" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--secondary)', borderRadius: '50%', marginBottom: '24px' }}>
              <Shield size={36} style={{ color: '#3b82f6' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>Guardia</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>Control de accesos, escaneo de QRs, registro de visitas y alertas de pánico.</p>
            <span style={{ color: '#3b82f6', fontWeight: 500, fontSize: '14px' }}>Ingresar al panel →</span>
          </div>
        </Link>

        {/* Residente */}
        <Link href="/panel-residente" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--secondary)', borderRadius: '50%', marginBottom: '24px' }}>
              <User size={36} style={{ color: '#eab308' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>Residente</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>Autorización de visitas, generación de QRs y comunicación directa con portería.</p>
            <span style={{ color: '#eab308', fontWeight: 500, fontSize: '14px' }}>Ingresar al panel →</span>
          </div>
        </Link>

      </div>

      <p style={{ marginTop: '60px', color: 'var(--muted-foreground)', fontSize: '14px', textAlign: 'center' }}>
        © 2026 WendigoSecurity. Todos los derechos reservados.
      </p>
    </div>
  );
}