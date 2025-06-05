
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
      {/* Dark indigo to deep navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900"></div>
      
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="particle-large particle-1"></div>
        <div className="particle-large particle-2"></div>
        <div className="particle-large particle-3"></div>
        
        {/* Medium floating orbs */}
        <div className="particle-medium particle-4"></div>
        <div className="particle-medium particle-5"></div>
        <div className="particle-medium particle-6"></div>
        
        {/* Small floating orbs */}
        <div className="particle-small particle-7"></div>
        <div className="particle-small particle-8"></div>
        <div className="particle-small particle-9"></div>
        <div className="particle-small particle-10"></div>
      </div>

      {/* Glassmorphism card */}
      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Printer className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold text-white">Integracopias</h1>
            </div>
            <p className="text-white/80">
              {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-white/90">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white/90">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg backdrop-blur-sm"
              disabled={loading}
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-400 hover:text-orange-300 backdrop-blur-sm"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{
        __html: `
          .particle-large {
            position: absolute;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 70%, transparent 100%);
            filter: blur(1px);
          }
          
          .particle-medium {
            position: absolute;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, rgba(147, 197, 253, 0.1) 70%, transparent 100%);
            filter: blur(1px);
          }
          
          .particle-small {
            position: absolute;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%);
            filter: blur(0.5px);
          }
          
          .particle-1 {
            top: 10%;
            left: 15%;
            animation: float-1 8s ease-in-out infinite;
          }
          
          .particle-2 {
            top: 60%;
            right: 10%;
            animation: float-2 10s ease-in-out infinite;
          }
          
          .particle-3 {
            bottom: 15%;
            left: 35%;
            animation: float-3 12s ease-in-out infinite;
          }
          
          .particle-4 {
            top: 25%;
            right: 30%;
            animation: float-4 7s ease-in-out infinite;
          }
          
          .particle-5 {
            bottom: 40%;
            left: 10%;
            animation: float-5 9s ease-in-out infinite;
          }
          
          .particle-6 {
            top: 70%;
            left: 60%;
            animation: float-6 11s ease-in-out infinite;
          }
          
          .particle-7 {
            top: 15%;
            left: 70%;
            animation: float-7 6s ease-in-out infinite;
          }
          
          .particle-8 {
            bottom: 25%;
            right: 25%;
            animation: float-8 8s ease-in-out infinite;
          }
          
          .particle-9 {
            top: 45%;
            left: 5%;
            animation: float-9 10s ease-in-out infinite;
          }
          
          .particle-10 {
            bottom: 10%;
            right: 45%;
            animation: float-10 7s ease-in-out infinite;
          }
          
          @keyframes float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(30px, -20px) scale(1.1); opacity: 0.5; }
            50% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.4; }
            75% { transform: translate(20px, 10px) scale(1.05); opacity: 0.6; }
          }
          
          @keyframes float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
            33% { transform: translate(-25px, 20px) scale(1.2); opacity: 0.3; }
            66% { transform: translate(15px, -25px) scale(0.8); opacity: 0.5; }
          }
          
          @keyframes float-3 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
            50% { transform: translate(40px, -30px) scale(1.3); opacity: 0.4; }
          }
          
          @keyframes float-4 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            25% { transform: translate(-15px, 25px) scale(0.9); opacity: 0.3; }
            75% { transform: translate(25px, -15px) scale(1.1); opacity: 0.4; }
          }
          
          @keyframes float-5 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            40% { transform: translate(20px, 30px) scale(1.2); opacity: 0.6; }
            80% { transform: translate(-30px, -10px) scale(0.8); opacity: 0.4; }
          }
          
          @keyframes float-6 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
            60% { transform: translate(-20px, -25px) scale(1.1); opacity: 0.2; }
          }
          
          @keyframes float-7 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            30% { transform: translate(15px, -20px) scale(0.7); opacity: 0.8; }
            70% { transform: translate(-10px, 15px) scale(1.3); opacity: 0.4; }
          }
          
          @keyframes float-8 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            50% { transform: translate(-25px, 20px) scale(1.4); opacity: 0.3; }
          }
          
          @keyframes float-9 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
            35% { transform: translate(30px, -15px) scale(0.9); opacity: 0.7; }
            65% { transform: translate(-15px, 25px) scale(1.2); opacity: 0.3; }
          }
          
          @keyframes float-10 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            45% { transform: translate(20px, 20px) scale(1.1); opacity: 0.6; }
            85% { transform: translate(-25px, -20px) scale(0.8); opacity: 0.4; }
          }
        `
      }} />
    </div>
  );
};
