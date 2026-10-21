import { BASE_URL } from "@/constant";
import { Carousel, Center, IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

const resolveImageUrl = (url: string) =>
    /^https?:\/\//i.test(url)
    ? url
    : `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`

export function WarehouseGallery({ urls, name }: { urls: string[]; name: string }) {
    const [failed, setFailed] = useState<Set<string>>(new Set())
    const images = urls.filter((u) => !failed.has(u))

    if (images.length === 0) {
        return (
        <Center h={{ base: '200px', md: '320px' }} bg="bg.muted" color="fg.muted">
            No image available
        </Center>
        )
    }

    return (
        <Carousel.Root
        slideCount={images.length}
        orientation="vertical"
        loop={images.length > 1}
        autoplay={images.length > 1}
        position="relative"
        w="100%"
        h={{ base: '200px', md: '320px' }}
        >
        <Carousel.ItemGroup w="100%" h="100%">
            {images.map((url, index) => (
            <Carousel.Item key={url} index={index} h="100%">
                <Image
                src={resolveImageUrl(url)}
                alt={`${name} photo ${index + 1}`}
                w="100%"
                h="100%"
                objectFit="cover"
                onError={() => setFailed((prev) => new Set(prev).add(url))}
                />
            </Carousel.Item>
            ))}
        </Carousel.ItemGroup>

        {images.length > 1 && (
            <Carousel.Control
            position="absolute"
            right={{ base: 2, md: 3 }}
            top={{ base: 2, md: 3 }}
            bottom={{ base: 2, md: 3 }}
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            zIndex={2}
            >
            <Carousel.PrevTrigger asChild>
                <IconButton aria-label="Previous photo" size={{ base: 'xs', md: 'sm' }} rounded="full" bg="white" color="gray.800" shadow="sm">
                <LuChevronUp />
                </IconButton>
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger asChild>
                <IconButton aria-label="Next photo" size={{ base: 'xs', md: 'sm' }} rounded="full" bg="white" color="gray.800" shadow="sm">
                <LuChevronDown />
                </IconButton>
            </Carousel.NextTrigger>
            </Carousel.Control>
        )}
        </Carousel.Root>
    )
}