import FormMessage from "@/components/form-message";
import UsersSecretMessages from "@/components/messages/users-secret-messages";

const SecretPageTwo = async () => {
  return (
    <>
      <div className="flex w-full flex-col gap-0 md:gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:max-w-lg order-1">
          <FormMessage />
        </div>
        <div className="w-full flex-1">
          <UsersSecretMessages />
        </div>
      </div>
    </>
  );
};

export default SecretPageTwo;
