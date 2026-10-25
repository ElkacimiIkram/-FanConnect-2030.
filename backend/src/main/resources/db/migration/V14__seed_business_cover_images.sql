-- Default cover images for seeded businesses without a photo
UPDATE businesses
SET cover_image_url = CASE name
    WHEN 'Green Leaf Café' THEN 'https://images.unsplash.com/photo-1554118811-1e0d58221f01?w=900&h=600&fit=crop&q=80'
    WHEN 'Urban Brew House' THEN 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=600&fit=crop&q=80'
    WHEN 'Sunset Terrace' THEN 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=600&fit=crop&q=80'
    ELSE cover_image_url
END
WHERE cover_image_url IS NULL OR TRIM(cover_image_url) = '';