-- Allow admins to delete files from suggestions-screenshots bucket
CREATE POLICY "Admins can delete screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'suggestions-screenshots' AND
    is_user_admin(auth.uid())
  );
