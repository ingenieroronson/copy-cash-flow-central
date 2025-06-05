
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Algo salió mal. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50"></div>
      
      {/* Ultra-small animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Tiny glowing particles */}
        <div className="particle-tiny particle-1"></div>
        <div className="particle-tiny particle-2"></div>
        <div className="particle-tiny particle-3"></div>
        <div className="particle-tiny particle-4"></div>
        <div className="particle-tiny particle-5"></div>
        <div className="particle-tiny particle-6"></div>
        <div className="particle-tiny particle-7"></div>
        <div className="particle-tiny particle-8"></div>
        <div className="particle-tiny particle-9"></div>
        <div className="particle-tiny particle-10"></div>
        <div className="particle-tiny particle-11"></div>
        <div className="particle-tiny particle-12"></div>
        <div className="particle-tiny particle-13"></div>
        <div className="particle-tiny particle-14"></div>
        <div className="particle-tiny particle-15"></div>
        <div className="particle-tiny particle-16"></div>
        <div className="particle-tiny particle-17"></div>
        <div className="particle-tiny particle-18"></div>
        <div className="particle-tiny particle-19"></div>
        <div className="particle-tiny particle-20"></div>
      </div>

      {/* Glow effect container with luxury card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-white/40 to-purple-200/30 blur-xl rounded-3xl transform scale-110"></div>
        
        {/* Main card with glassmorphism */}
        <Card className="relative backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl shadow-purple-500/10 rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-white/60 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                  <Printer className="w-8 h-8 text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Integracopias</h1>
              </div>
              <p className="text-slate-600">
                {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/60 border-white/40 text-slate-800 placeholder:text-slate-400 backdrop-blur-sm focus:bg-white/80 focus:border-purple-300 shadow-sm"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/60 border-white/40 text-slate-800 placeholder:text-slate-400 backdrop-blur-sm focus:bg-white/80 focus:border-purple-300 shadow-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/60 border-white/40 text-slate-800 placeholder:text-slate-400 backdrop-blur-sm focus:bg-white/80 focus:border-purple-300 shadow-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                disabled={loading}
              >
                {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .particle-tiny {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
            filter: blur(0.5px);
            box-shadow: 0 0 6px rgba(147, 51, 234, 0.3);
          }
          
          /* Particle positions and animations */
          .particle-1 { top: 10%; left: 15%; animation: float-gentle-1 12s ease-in-out infinite; }
          .particle-2 { top: 20%; left: 80%; animation: float-gentle-2 15s ease-in-out infinite; }
          .particle-3 { top: 30%; left: 25%; animation: float-gentle-3 18s ease-in-out infinite; }
          .particle-4 { top: 40%; left: 70%; animation: float-gentle-4 14s ease-in-out infinite; }
          .particle-5 { top: 50%; left: 10%; animation: float-gentle-5 16s ease-in-out infinite; }
          .particle-6 { top: 60%; left: 85%; animation: float-gentle-6 13s ease-in-out infinite; }
          .particle-7 { top: 70%; left: 35%; animation: float-gentle-7 17s ease-in-out infinite; }
          .particle-8 { top: 80%; left: 60%; animation: float-gentle-8 19s ease-in-out infinite; }
          .particle-9 { top: 15%; left: 50%; animation: float-gentle-9 11s ease-in-out infinite; }
          .particle-10 { top: 35%; left: 90%; animation: float-gentle-10 20s ease-in-out infinite; }
          .particle-11 { top: 25%; left: 5%; animation: float-gentle-11 14s ease-in-out infinite; }
          .particle-12 { top: 45%; left: 40%; animation: float-gentle-12 16s ease-in-out infinite; }
          .particle-13 { top: 55%; left: 75%; animation: float-gentle-13 12s ease-in-out infinite; }
          .particle-14 { top: 65%; left: 20%; animation: float-gentle-14 18s ease-in-out infinite; }
          .particle-15 { top: 75%; left: 95%; animation: float-gentle-15 15s ease-in-out infinite; }
          .particle-16 { top: 85%; left: 45%; animation: float-gentle-16 13s ease-in-out infinite; }
          .particle-17 { top: 5%; left: 65%; animation: float-gentle-17 17s ease-in-out infinite; }
          .particle-18 { top: 95%; left: 30%; animation: float-gentle-18 19s ease-in-out infinite; }
          .particle-19 { top: 12%; left: 78%; animation: float-gentle-19 21s ease-in-out infinite; }
          .particle-20 { top: 88%; left: 12%; animation: float-gentle-20 14s ease-in-out infinite; }
          
          /* Gentle floating animations */
          @keyframes float-gentle-1 {
            0%, 100% { transform: translate(0, 0); opacity: 0.3; }
            25% { transform: translate(10px, -8px); opacity: 0.7; }
            50% { transform: translate(-5px, 12px); opacity: 0.5; }
            75% { transform: translate(8px, 5px); opacity: 0.8; }
          }
          
          @keyframes float-gentle-2 {
            0%, 100% { transform: translate(0, 0); opacity: 0.4; }
            33% { transform: translate(-12px, 10px); opacity: 0.6; }
            66% { transform: translate(8px, -15px); opacity: 0.8; }
          }
          
          @keyframes float-gentle-3 {
            0%, 100% { transform: translate(0, 0); opacity: 0.2; }
            50% { transform: translate(15px, -10px); opacity: 0.9; }
          }
          
          @keyframes float-gentle-4 {
            0%, 100% { transform: translate(0, 0); opacity: 0.5; }
            25% { transform: translate(-8px, 12px); opacity: 0.3; }
            75% { transform: translate(12px, -8px); opacity: 0.7; }
          }
          
          @keyframes float-gentle-5 {
            0%, 100% { transform: translate(0, 0); opacity: 0.6; }
            40% { transform: translate(10px, 15px); opacity: 0.4; }
            80% { transform: translate(-15px, -5px); opacity: 0.8; }
          }
          
          @keyframes float-gentle-6 {
            0%, 100% { transform: translate(0, 0); opacity: 0.3; }
            60% { transform: translate(-10px, -12px); opacity: 0.7; }
          }
          
          @keyframes float-gentle-7 {
            0%, 100% { transform: translate(0, 0); opacity: 0.7; }
            30% { transform: translate(8px, -10px); opacity: 0.4; }
            70% { transform: translate(-5px, 8px); opacity: 0.9; }
          }
          
          @keyframes float-gentle-8 {
            0%, 100% { transform: translate(0, 0); opacity: 0.4; }
            50% { transform: translate(-12px, 10px); opacity: 0.6; }
          }
          
          @keyframes float-gentle-9 {
            0%, 100% { transform: translate(0, 0); opacity: 0.5; }
            35% { transform: translate(15px, -8px); opacity: 0.8; }
            65% { transform: translate(-8px, 12px); opacity: 0.3; }
          }
          
          @keyframes float-gentle-10 {
            0%, 100% { transform: translate(0, 0); opacity: 0.6; }
            45% { transform: translate(10px, 10px); opacity: 0.4; }
            85% { transform: translate(-12px, -10px); opacity: 0.7; }
          }
          
          @keyframes float-gentle-11 {
            0%, 100% { transform: translate(0, 0); opacity: 0.3; }
            50% { transform: translate(12px, -15px); opacity: 0.8; }
          }
          
          @keyframes float-gentle-12 {
            0%, 100% { transform: translate(0, 0); opacity: 0.7; }
            25% { transform: translate(-10px, 8px); opacity: 0.5; }
            75% { transform: translate(8px, -12px); opacity: 0.9; }
          }
          
          @keyframes float-gentle-13 {
            0%, 100% { transform: translate(0, 0); opacity: 0.4; }
            40% { transform: translate(15px, 5px); opacity: 0.6; }
            80% { transform: translate(-8px, -10px); opacity: 0.8; }
          }
          
          @keyframes float-gentle-14 {
            0%, 100% { transform: translate(0, 0); opacity: 0.5; }
            60% { transform: translate(-12px, 12px); opacity: 0.3; }
          }
          
          @keyframes float-gentle-15 {
            0%, 100% { transform: translate(0, 0); opacity: 0.6; }
            30% { transform: translate(8px, -8px); opacity: 0.7; }
            70% { transform: translate(-10px, 10px); opacity: 0.4; }
          }
          
          @keyframes float-gentle-16 {
            0%, 100% { transform: translate(0, 0); opacity: 0.3; }
            50% { transform: translate(12px, -12px); opacity: 0.9; }
          }
          
          @keyframes float-gentle-17 {
            0%, 100% { transform: translate(0, 0); opacity: 0.8; }
            35% { transform: translate(-15px, 8px); opacity: 0.4; }
            65% { transform: translate(10px, -10px); opacity: 0.6; }
          }
          
          @keyframes float-gentle-18 {
            0%, 100% { transform: translate(0, 0); opacity: 0.4; }
            45% { transform: translate(8px, 15px); opacity: 0.7; }
            85% { transform: translate(-12px, -8px); opacity: 0.5; }
          }
          
          @keyframes float-gentle-19 {
            0%, 100% { transform: translate(0, 0); opacity: 0.5; }
            25% { transform: translate(10px, -12px); opacity: 0.8; }
            75% { transform: translate(-8px, 8px); opacity: 0.3; }
          }
          
          @keyframes float-gentle-20 {
            0%, 100% { transform: translate(0, 0); opacity: 0.6; }
            50% { transform: translate(-10px, -15px); opacity: 0.4; }
          }
        `
      }} />
    </div>
  );
};
