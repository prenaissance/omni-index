import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const Login = () => {
  return (
    <div className="flex justify-between h-[calc(100vh-80px)] overflow-auto">
      <div className="h-full flex-1 flex flex-col justify-center items-center">
        <div className="h-full flex-1 flex flex-col justify-center items-center">
          <h1 className="text-[2.2rem] font-bold">Welcome Back</h1>
          <p className="text-[0.9rem] font-light mb-9">
            Please, enter your details
          </p>
          <Form
            className="w-80 flex flex-col gap-2 mb-9"
            action="/api/oauth/login"
            method="POST"
          >
            <title>Login</title>
            <Label>
              <Input
                name="handle"
                placeholder="alice.bsky.social"
                className="bg-card border-card p-5"
              />
            </Label>
            <Button className="mt-2 w-full" type="submit">
              Login
            </Button>
          </Form>
        </div>
      </div>
      <div className="w-1/2">
        <img
          src="login.png"
          alt="login-image"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
