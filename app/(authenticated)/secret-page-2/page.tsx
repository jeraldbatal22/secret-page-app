import AllUsersSecretMessages from "@/components/all-users-secret-messages";
import FormMessage from "@/components/form-message";

const SecretPageTwo = () => {
  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full lg:max-w-lg">
        <FormMessage />
      </div>
      <div className="w-full flex-1">
        <AllUsersSecretMessages />
      </div>
    </div>
  );
};

export default SecretPageTwo;
