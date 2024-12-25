import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const Login = () => {
  return (
    <form
      className="p-2 w-80 block"
      action="http://localhost:8080/api/oauth/login"
      method="POST"
    >
      <title>Login (can be later changed to a widget)</title>
      <Label></Label>
      <Input name="handle" placeholder="alice.bsky.social" />
      <Button className="mt-2 w-full" type="submit">
        Login
      </Button>
    </form>
  );
};

export default Login;
