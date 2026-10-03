"use client";
import { Joyride, Props as JoyrideProps } from 'react-joyride';

export default function JoyrideWrapper(props: any) {
  // @ts-ignore
  return <Joyride {...props} />;
}
