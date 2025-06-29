import React, { useMemo } from 'react';
import { NumberInput } from '@chakra-ui/react';

export default function NumberInputRoot({ formatOptions, ...props }) {
  const format = useMemo(() => {
    if (!formatOptions) return value => value;
    const formatter = new Intl.NumberFormat(undefined, formatOptions);
    return value => {
      if (value === null || value === undefined || value === '') return '';
      return formatter.format(value);
    };
  }, [formatOptions]);

  const parse = useMemo(() => {
    if (!formatOptions) return value => value;
    return value => value.replace(/[^0-9.+-]/g, '');
  }, [formatOptions]);

  return <NumberInput format={format} parse={parse} {...props} />;
}
