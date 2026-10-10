import { register, sendOtp, verifyOtp } from '@/lib/api/auth';
import { authQueryOptions } from '@/lib/provider';
import type { ApiError, RegisterRequest, Step } from '@/types';
import { validateEmail } from '@/utils/email';
import { Box, Button, Field, FileUpload, Flex, Float, Heading, Input, InputGroup, PinInput, RadioCard, Stack, Steps, Text, useFileUploadContext } from '@chakra-ui/react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { useState } from 'react';
import { LuFileUp, LuUser, LuX } from 'react-icons/lu';
import { MdEmail } from 'react-icons/md';

export const Route = createFileRoute('/register')({
  beforeLoad: async ({ context }) => {
    const currentUser = await context.queryClient.query(authQueryOptions);
    if (currentUser) throw redirect({ to: "/" });
  },
  component: Register,
})

const FileUploadList = () => {
  const fileUpload = useFileUploadContext()
  const file = fileUpload.acceptedFiles
  if(file.length === 0) return null
  return(
    <FileUpload.ItemGroup alignItems='center'>
      {file.map((file) => (
        <FileUpload.Item
          borderRadius='full'
          boxSize='24'
          p="0"
          w='24'
          overflow='hidden'
          position='relative'
          border='1px solid gray.200'
          file={file}
          key={file.name}
        >
          <Box boxSize="100%" rounded="full" overflow="hidden">
            <FileUpload.ItemPreviewImage
              boxSize="100%"
              objectFit="cover"
              rounded="full"
            />
          </Box>

          <Float placement="top-end" offset="2">
            <FileUpload.ItemDeleteTrigger
              boxSize="5"
              rounded="full"
              bg="white"
              boxShadow="sm"
              color="gray.800"
            >
              <LuX />
            </FileUpload.ItemDeleteTrigger>
          </Float>
        </FileUpload.Item>
      ))}
    </FileUpload.ItemGroup>
  )
}


const STEPS: Step[] = ["info", "otp", "information"];
const STEP_META = [
  { title: "Create Account", description: "Enter your details" },
  { title: "Verify OTP", description: "Confirm your email" },
  { title: "Set Profile Info", description: "Set information" },
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [data, setData] = useState<RegisterRequest>({
    email: "", name: "", otp: "", contactNumber: "", userType: "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepIndex = STEPS.indexOf(step);

  const update = (fields: Partial<RegisterRequest>) =>
    setData((prev) => ({ ...prev, ...fields }));

  const goNext = (next: Step) => {
    setError("");
    setStep(next);
  }

  const handleSendOtp = async () => {
    if (!data.email || !data.name) {
      setError("Email and name are required");
      return;
    }
    if(!validateEmail(data.email)){
      setError("Please enter a valid email")
      return
    }

    setError("");
    setLoading(true);

    try {
      await sendOtp(data.name, data.email);
      update({ otp: "" });
      goNext("otp");
    } catch(err) {
      if (axios.isAxiosError<ApiError>(err)) {
        setError(err.response?.data?.message ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (data.otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError('');

    try {
        const res = await verifyOtp(data.email, data.otp);
        if (res.success && res.action === "ONBOARDING") {
          goNext("information");
        } else {
          setError("Invalid or expired code");
        }
      } catch {
        setError("Invalid or expired code");
      } finally {
    setLoading(false);
  }
  };

  const handleSubmit = async () => {
    if(!data.userType) {
      setError('Please select a role')
      return;
    }
    if (data.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(data.email,data.contactNumber,data.password,data.userType)
      navigate({ to: "/" });
    } catch {
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg">
      <Steps.Root step={stepIndex} count={STEPS.length}>
        <Steps.List>
          {STEP_META.map((s, index) => (
            <Steps.Item key={index} index={index} title={s.title}>
              <Steps.Indicator />
              <Steps.Title>{s.title}</Steps.Title>
              <Steps.Separator />
            </Steps.Item>
          ))}
        </Steps.List>
      </Steps.Root>

      {step === "info" && (
        <Stack gap={4} mt={6}>
          <Heading size="md">Create your account</Heading>
          <Field.Root>
            <Field.Label>Username</Field.Label>
            <InputGroup startElement={<LuUser/>}>
            <Input
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Username"
            />
            </InputGroup>
          </Field.Root>
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <InputGroup startElement={<MdEmail/>}>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="Email@example.com"
            />
            </InputGroup>
          </Field.Root>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Flex justifyContent='space-around'>
            <Button variant="outline" onClick={() => navigate({ to: "/login" })}>
              Go to login
            </Button>
            <Button onClick={handleSendOtp} loading={loading}>
              Continue
            </Button>
          </Flex>
        </Stack>
      )}

      {step === "otp" && (
        <Stack gap={4} mt={6}>
          <Heading size="md">Verify your email</Heading>
          <Text fontSize="sm" color="gray.500">
            Code sent to {data.email}
          </Text>
          <PinInput.Root w='100%' px='10'
            value={Array.from({ length: 6 }, (_, i) => data.otp[i] ?? "")}
            onValueChange={(e) => update({ otp: e.value.map((v) => v ?? "").join("") })}
            otp
            count={6}
            placeholder=''
          >
            <PinInput.HiddenInput />
            <PinInput.Control display='flex' justifyContent='center' gap='5' w='100%'>
              {[...Array(6)].map((_, i) => (
                <PinInput.Input key={i} index={i}
                  minW="0"
                  flex='1'
                  h="12"
                  fontSize="2xl"
                  fontWeight="semibold"
                  textAlign="center"
                />
              ))}
            </PinInput.Control>
          </PinInput.Root>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button onClick={handleVerifyOtp} loading={loading} >
            Verify
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSendOtp}>
            Resend code
          </Button>
        </Stack>
      )}

      {step === "information" && (
        <Stack gap={4} mt={6}>
          <Heading size="md">Set Profile Information</Heading>

          <FileUpload.Root gap="3" alignItems="center">
            <FileUpload.HiddenInput />
            <FileUpload.Label>Upload Profile Picture</FileUpload.Label>
            <FileUploadList/>
            <FileUpload.Trigger asChild>
              <Button variant="outline" size="sm"><LuFileUp /> Choose file</Button>
            </FileUpload.Trigger>
          </FileUpload.Root>

          <Field.Root>
            <Field.Label>Phone Number</Field.Label>
            <Input
              value={data.contactNumber}
              onChange={(e) => update({ contactNumber: e.target.value })}
              placeholder="Phone Number"
            />
          </Field.Root>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}

          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              value={data.password}
              onChange={(e) => update({ password: e.target.value })}
              placeholder="*******"
            />
          </Field.Root>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}

          <RadioCard.Root
            value={data.userType}
            onValueChange={(e) => update({ userType: e.value as RegisterRequest["userType"] })}
          >
            <Stack gap={3}>
              <RadioCard.Item value="BUYER_ROLE">
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <RadioCard.ItemText>
                    Buyer
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription>
                    Rent storage space from sellers
                  </RadioCard.ItemDescription>
                </RadioCard.ItemControl>
              </RadioCard.Item>

              <RadioCard.Item value="SELLER_ROLE">
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <RadioCard.ItemText>
                    Seller
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription>
                    List warehouse space for rent
                  </RadioCard.ItemDescription>
                </RadioCard.ItemControl>
              </RadioCard.Item>
            </Stack>
          </RadioCard.Root>

          <Button onClick={handleSubmit} loading={loading}>
            Create account
          </Button>
        </Stack>
      )}
    </Box>
  )
}