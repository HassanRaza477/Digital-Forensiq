from PIL import Image, ExifTags
import logging


def check_c2pa(image_path: str) -> dict:
    """
    C2PA "Content Credentials" check karta hai -- yeh classic EXIF se
    ALAG hai. Kuch AI generators (aur kuch camera makers) is format
    mein embed karte hain ke content kaise bana.

    ZAROORI LIMITATION: agar yahan kuch na mile, iska matlab yeh NAHI
    hai ke image AI-generated nahi hai -- bohot se tools C2PA embed
    karte hi nahi, ya koi bhi tool se aasani se strip ho sakta hai.
    Yeh ek POSITIVE signal ke liye hai, negative confirmation ke liye
    nahi.
    """
    try:
        from c2pa import Reader
        reader = Reader.try_create(image_path)
        if reader is not None:
            active_manifest = reader.get_active_manifest() or {}
            producer = None
            gen_info = active_manifest.get("claim_generator_info", [])
            if gen_info and isinstance(gen_info, list) and len(gen_info) > 0:
                producer = gen_info[0].get("name")
            elif active_manifest.get("claim_generator"):
                producer = active_manifest.get("claim_generator")

            return {
                "c2pa_found": True,
                "producer": producer,
                "provenance_summary": active_manifest.get("title") or "C2PA Provenance verified",
                "manifest_summary": reader.json()[:500],
                "note": "Content credentials found -- this image has an attached manifest describing its origin/edit history.",
            }
        return {
            "c2pa_found": False,
            "producer": None,
            "provenance_summary": None,
            "note": "No C2PA content credentials found. This does NOT confirm the image is authentic or unedited -- many tools do not embed this data, or it can be stripped.",
        }
    except Exception as e:
        return {
            "c2pa_found": False,
            "producer": None,
            "provenance_summary": None,
            "note": "No C2PA content credentials found. This does NOT confirm the image is authentic or unedited -- many tools do not embed this data, or it can be stripped.",
            "detail": str(e),
        }


def analyze(image_path):
    try:
        with Image.open(image_path) as img:
            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            exif_data = img._getexif()

            result = {
                "exif_found": False,
                "camera_make": None,
                "camera_model": None,
                "software": None,
                "gps_lat": None,
                "gps_lng": None,
                "google_maps_link": None,
                "thumbnail_detected": False
            }

            if exif_data:
                result["exif_found"] = True

                for tag_id, value in exif_data.items():
                    tag_name = ExifTags.TAGS.get(tag_id, tag_id)
                    if tag_name == "Make":
                        result["camera_make"] = value.strip()
                    elif tag_name == "Model":
                        result["camera_model"] = value.strip()
                    elif tag_name == "Software":
                        result["software"] = value.strip()

                gps_info = {}
                for tag_id, value in exif_data.items():
                    if tag_id in ExifTags.GPSTAGS:
                        gps_info[ExifTags.GPSTAGS[tag_id]] = value

                if gps_info.get("GPSLatitude") and gps_info.get("GPSLongitude"):
                    def convert_to_degrees(value):
                        d, m, s = value
                        return float(d) + (float(m) / 60.0) + (float(s) / 3600.0)

                    lat = convert_to_degrees(gps_info["GPSLatitude"])
                    lng = convert_to_degrees(gps_info["GPSLongitude"])
                    if gps_info.get("GPSLatitudeRef") == "S":
                        lat = -lat
                    if gps_info.get("GPSLongitudeRef") == "W":
                        lng = -lng

                    result["gps_lat"] = round(lat, 6)
                    result["gps_lng"] = round(lng, 6)
                    result["google_maps_link"] = f"https://www.google.com/maps?q={lat},{lng}"

                if exif_data.get(0x0201):
                    result["thumbnail_detected"] = True

            result["c2pa"] = check_c2pa(image_path)

            return result
    except Exception as e:
        logging.error(f"Metadata extraction failed for {image_path}: {str(e)}")
        return {"error": f"Metadata extraction failed: {str(e)}"}