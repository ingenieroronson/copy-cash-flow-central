
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
      {/* Creative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"></div>
      
      {/* Animated 3D floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large orange sphere - top right */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-80 blur-sm animate-float-slow"></div>
        
        {/* Medium orange sphere - bottom left */}
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 opacity-70 blur-sm animate-float-medium"></div>
        
        {/* Blue glowing orb - left center */}
        <div className="absolute top-1/3 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-60 blur-sm animate-float-gentle"></div>
        
        {/* Small orange accent - top left */}
        <div className="absolute top-20 left-20 w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 opacity-50 blur-sm animate-float-fast"></div>
        
        {/* Purple accent orb - bottom right */}
        <div className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-50 blur-sm animate-float-medium"></div>
        
        {/* Abstract curved elements */}
        <div className="absolute top-10 right-1/3 w-80 h-20 bg-gradient-to-r from-orange-400/30 to-transparent rounded-full blur-md rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-20 left-1/4 w-60 h-16 bg-gradient-to-l from-blue-400/30 to-transparent rounded-full blur-md -rotate-12 animate-float-gentle"></div>
      </div>

      {/* Glassmorphism login container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-white/10 to-orange-400/20 blur-2xl rounded-3xl transform scale-110"></div>
        
        {/* Main glassmorphism card */}
        <Card className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-orange-500/10 rounded-3xl"></div>
          
          <CardContent className="relative p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                  <Printer className="w-8 h-8 text-orange-400" />
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
                  <Label htmlFor="name" className="text-white/90 font-medium">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/30 focus:border-orange-400/50 shadow-sm"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/30 focus:border-orange-400/50 shadow-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white/90 font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/30 focus:border-orange-400/50 shadow-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 mt-6 border-0"
                disabled={loading}
              >
                {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-10px, -15px) rotate(90deg); }
            50% { transform: translate(5px, -25px) rotate(180deg); }
            75% { transform: translate(15px, -10px) rotate(270deg); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(20px, -20px) rotate(120deg); }
            66% { transform: translate(-15px, 10px) rotate(240deg); }
          }
          
          @keyframes float-gentle {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, -30px) scale(1.1); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            20% { transform: translate(15px, -10px) rotate(72deg); }
            40% { transform: translate(-10px, -20px) rotate(144deg); }
            60% { transform: translate(-20px, 5px) rotate(216deg); }
            80% { transform: translate(10px, 15px) rotate(288deg); }
          }
          
          .animate-float-slow {
            animation: float-slow 20s ease-in-out infinite;
          }
          
          .animate-float-medium {
            animation: float-medium 15s ease-in-out infinite;
          }
          
          .animate-float-gentle {
            animation: float-gentle 18s ease-in-out infinite;
          }
          
          .animate-float-fast {
            animation: float-fast 12s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};
