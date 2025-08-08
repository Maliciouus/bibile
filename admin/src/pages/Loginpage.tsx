import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Loginpage = () => {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleLogin = () => {
    if (
      formValues.email === "admin@gmail.com" &&
      formValues.password === "admin"
    ) {
      localStorage.setItem("isLogin", "true");
      toast.success("Login Successful");
      navigate("/dashboard");
    } else {
      toast.error("Invalid email or password");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("isLogin") === "true") {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className='flex justify-center items-center h-screen bg-gray-500'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='m@example.com'
              onChange={(e: any) =>
                setFormValues({ ...formValues, email: e.target.value })
              }
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              onChange={(e: any) =>
                setFormValues({ ...formValues, password: e.target.value })
              }
              id='password'
              type='password'
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleLogin()} className='w-full'>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Loginpage;
