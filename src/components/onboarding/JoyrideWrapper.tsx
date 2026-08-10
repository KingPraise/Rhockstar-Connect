"use client";
import ReactJoyride, { Props as JoyrideProps } from 'react-joyride';

export default function JoyrideWrapper(props: JoyrideProps) {
  return <ReactJoyride {...props} />;
}
