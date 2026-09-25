import { Box, IconButton } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { FaBell } from 'react-icons/fa';

export function Badge ({ count }: { count: number }) {
    return (
        <IconButton
            css={css`
              position: relative !important;
            `}
            py={'2'}
            colorScheme={'gray'}
            aria-label={'Notifications'}
            size={'lg'}>
                <FaBell color={'gray.750'} />
                <Box as={'span'} color={'white'} position={'absolute'} top={'6px'} right={'4px'} fontSize={'0.8rem'}
                    bgColor={'red'} borderRadius={'llg'} zIndex={9999} p={'1px'}>
                    {count}
                </Box>
        </IconButton>
        
    );
}