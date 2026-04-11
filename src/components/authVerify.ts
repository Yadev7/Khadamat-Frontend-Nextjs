const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || cookieStore.get('refreshToken')?.value;

  // If Middleware failed or was late, this stops the render NOW.
  if (!token) {
    redirect('/sign-in');
  }