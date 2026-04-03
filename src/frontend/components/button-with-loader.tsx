import { Button, ButtonProps, Spinner } from "@heroui/react";

export type ButtonWithLoaderProps = ButtonProps & {
  isLoading?: boolean;
  loaderText?: string;
};

export const ButtonWithLoader = ({
  loaderText,
  isLoading,
  children,
  ...props
}: ButtonWithLoaderProps) => {
  return (
    <Button isPending={isLoading} {...props}>
      {({ isPending }) => (
        <>
          {isPending ? (
            <>
              <Spinner color="current" size="sm" /> {loaderText ?? children}
            </>
          ) : (
            children
          )}
        </>
      )}
    </Button>
  );
};
