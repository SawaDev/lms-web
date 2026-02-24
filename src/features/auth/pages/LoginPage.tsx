import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { formatPhoneNumber, cleanPhoneNumber } from "@/lib/phone";

const loginSchema = z.object({
  phone: z.string().refine((val) => {
    const cleaned = cleanPhoneNumber(val);
    // Allow 9 digits (local) or 12 digits (full with 998)
    return (cleaned.length === 12 && cleaned.startsWith("998")) || cleaned.length === 9;
  }, "Phone number must be valid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error: serverError } = useLogin();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    const cleaned = cleanPhoneNumber(data.phone);
    // Ensure it starts with 998
    const finalPhone = cleaned.startsWith("998") ? cleaned : `998${cleaned}`;
    
    login({
      phone: finalPhone,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
             <span className="text-white text-3xl font-bold">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Log in</CardTitle>
          <p className="text-slate-500 text-sm">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Your Phone</Label>
              <Controller<LoginFormValues>
                control={control}
                name="phone"
                render={({ field }) => {
                  const { onChange, value, ...fieldRest } = field;
                  const valueStr = String(value ?? "");
                  // Extract digits from value (remove +998 prefix if present)
                  const digits = cleanPhoneNumber(valueStr).replace(/^998/, "");
                  const formatted = digits ? `+998 ${formatPhoneNumber(digits)}` : "+998 ";
                  
                  return (
                    <Input
                      {...fieldRest}
                      id="phone"
                      placeholder="+998 (xx) xxx-xx-xx"
                      value={formatted}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        // Remove everything except digits
                        const numbers = rawValue.replace(/\D/g, "");
                        // If starts with 998, remove it (we'll add it back)
                        const withoutPrefix = numbers.startsWith("998") 
                          ? numbers.slice(3) 
                          : numbers;
                        // Limit to 9 digits (local number)
                        const truncated = withoutPrefix.slice(0, 9);
                        // Store with 998 prefix
                        onChange(truncated ? `998${truncated}` : "");
                      }}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  );
                }}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm text-center">
                {(serverError as any).response?.data?.message || "Invalid phone number or password"}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
