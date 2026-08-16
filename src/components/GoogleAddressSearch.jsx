import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function GoogleAddressSearch({
  value,
  onChange,
  onSelect,
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onSelectRef = useRef(onSelect);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always keep the latest callbacks
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let listener;

    async function loadGooglePlaces() {
      try {
        if (!API_KEY) {
          throw new Error(
            "VITE_GOOGLE_MAPS_API_KEY is missing"
          );
        }

        setOptions({
          key: API_KEY,
          v: "weekly",
        });

        const { Autocomplete } =
          await importLibrary("places");

        if (!inputRef.current) return;

        const autocomplete =
          new Autocomplete(inputRef.current, {
            fields: [
              "formatted_address",
              "geometry",
              "name",
              "address_components",
            ],
            componentRestrictions: {
              country: "in",
            },
          });

        autocompleteRef.current = autocomplete;

        listener = autocomplete.addListener(
          "place_changed",
          () => {
            const place = autocomplete.getPlace();

            if (!place.geometry?.location) {
              console.warn(
                "No location found for selected place"
              );
              return;
            }

            const lat =
              place.geometry.location.lat();

            const lng =
              place.geometry.location.lng();

            const address =
              place.formatted_address ||
              place.name ||
              "";

            // IMPORTANT:
            // Update React's controlled value
            // immediately after Google selection.
            onChangeRef.current(address);

            // Send complete location data to parent
            onSelectRef.current({
              address,
              lat,
              lng,
              place,
            });
          }
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "Google Maps failed to load:",
          error
        );

        setError(
          "Address search could not be loaded."
        );

        setLoading(false);
      }
    }

    loadGooglePlaces();

    return () => {
      if (listener) {
        listener.remove();
      }

      autocompleteRef.current = null;
    };
  }, []);

  return (
    <div className="field">
      <label className="field__label">
        Delivery address
      </label>

      <input
        ref={inputRef}
        type="text"
        className="field__input"
        placeholder={
          loading
            ? "Loading address search..."
            : "Search delivery address"
        }
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={loading}
        autoComplete="off"
      />

      {error && (
        <p className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}