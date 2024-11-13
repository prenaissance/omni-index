import { Box, Input, Text, chakra } from "@chakra-ui/react";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

const Login = () => {
  return (
    <chakra.form
      p={2}
      w="20rem"
      action="http://localhost:8080/api/oauth/login"
      method="POST"
    >
      <Text>Login (can be later changed to a widget)</Text>
      <Field label="Handle">
        <Input name="handle" placeholder="alice.bsky.social" />
      </Field>
      <Button mt={2} w="full" type="submit">
        Login
      </Button>
    </chakra.form>
  );
};

export default Login;
