with open("src/app/(dashboard)/dating/profile/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

wrapper_components = """
const ObjectUrlImage = ({ file, alt, className }: { file: File, alt: string, className: string }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img src={url} alt={alt} className={className} /> : null;
};

const ObjectUrlAudio = ({ file, className }: { file: File, className: string }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <audio controls src={url} className={className} /> : null;
};
"""

content = content.replace("export default function DatingProfileSetup() {", wrapper_components + "\nexport default function DatingProfileSetup() {")

with open("src/app/(dashboard)/dating/profile/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
