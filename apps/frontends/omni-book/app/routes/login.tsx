import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const Login = () => {
  return (
    <Form className="p-2 w-80 block" action="/api/oauth/login" method="POST">
      <title>Login</title>
      <Label>
        <Input name="handle" placeholder="alice.bsky.social" />
      </Label>
      <Button className="mt-2 w-full" type="submit">
        Login
      </Button>
    </Form>
  );
};

export default Login;
