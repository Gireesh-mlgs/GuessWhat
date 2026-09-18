import { redirect } from 'next/navigation';

export default function UnlimitedPage() {
  redirect('/music/banger?mode=unlimited');
}
