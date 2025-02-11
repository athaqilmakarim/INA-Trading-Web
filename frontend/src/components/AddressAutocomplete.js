import React, { useEffect, useRef, useState, useMemo } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';

const countrySpecificFields = {
  ID: {
    fields: [
      { name: 'streetAddress', label: 'Nama Jalan' },
      { name: 'rt', label: 'RT' },
      { name: 'rw', label: 'RW' },
      { name: 'kelurahan', label: 'Kelurahan/Desa' },
      { name: 'kecamatan', label: 'Kecamatan' },
      { name: 'city', label: 'Kota/Kabupaten' },
      { name: 'province', label: 'Provinsi' },
      { name: 'postalCode', label: 'Kode Pos' }
    ]
  },
  AU: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'suburb', label: 'Suburb' },
      { name: 'state', label: 'State/Territory' },
      { name: 'postalCode', label: 'Postcode' }
    ],
    states: [
      { value: 'NSW', label: 'New South Wales' },
      { value: 'VIC', label: 'Victoria' },
      { value: 'QLD', label: 'Queensland' },
      { value: 'WA', label: 'Western Australia' },
      { value: 'SA', label: 'South Australia' },
      { value: 'TAS', label: 'Tasmania' },
      { value: 'ACT', label: 'Australian Capital Territory' },
      { value: 'NT', label: 'Northern Territory' }
    ]
  },
  US: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'unit', label: 'Apt/Suite/Unit' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State' },
      { name: 'postalCode', label: 'ZIP Code' }
    ],
    states: [
      { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
      { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
      { value: 'DC', label: 'District of Columbia' }
    ]
  },
  GB: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'locality', label: 'Locality' },
      { name: 'city', label: 'Town/City' },
      { name: 'county', label: 'County' },
      { name: 'postalCode', label: 'Postcode' }
    ]
  },
  JP: {
    fields: [
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'prefecture', label: 'Prefecture' },
      { name: 'city', label: 'City' },
      { name: 'ward', label: 'Ward' },
      { name: 'block', label: 'Block Number' },
      { name: 'building', label: 'Building Name/Room Number' }
    ],
    prefectures: [
      { value: '北海道', label: '北海道' }, { value: '青森県', label: '青森県' },
      { value: '岩手県', label: '岩手県' }, { value: '宮城県', label: '宮城県' },
      { value: '秋田県', label: '秋田県' }, { value: '山形県', label: '山形県' },
      { value: '福島県', label: '福島県' }, { value: '茨城県', label: '茨城県' },
      { value: '栃木県', label: '栃木県' }, { value: '群馬県', label: '群馬県' },
      { value: '埼玉県', label: '埼玉県' }, { value: '千葉県', label: '千葉県' },
      { value: '東京都', label: '東京都' }, { value: '神奈川県', label: '神奈川県' },
      { value: '新潟県', label: '新潟県' }, { value: '富山県', label: '富山県' },
      { value: '石川県', label: '石川県' }, { value: '福井県', label: '福井県' },
      { value: '山梨県', label: '山梨県' }, { value: '長野県', label: '長野県' },
      { value: '岐阜県', label: '岐阜県' }, { value: '静岡県', label: '静岡県' },
      { value: '愛知県', label: '愛知県' }, { value: '三重県', label: '三重県' },
      { value: '滋賀県', label: '滋賀県' }, { value: '京都府', label: '京都府' },
      { value: '大阪府', label: '大阪府' }, { value: '兵庫県', label: '兵庫県' },
      { value: '奈良県', label: '奈良県' }, { value: '和歌山県', label: '和歌山県' },
      { value: '鳥取県', label: '鳥取県' }, { value: '島根県', label: '島根県' },
      { value: '岡山県', label: '岡山県' }, { value: '広島県', label: '広島県' },
      { value: '山口県', label: '山口県' }, { value: '徳島県', label: '徳島県' },
      { value: '香川県', label: '香川県' }, { value: '愛媛県', label: '愛媛県' },
      { value: '高知県', label: '高知県' }, { value: '福岡県', label: '福岡県' },
      { value: '佐賀県', label: '佐賀県' }, { value: '長崎県', label: '長崎県' },
      { value: '熊本県', label: '熊本県' }, { value: '大分県', label: '大分県' },
      { value: '宮崎県', label: '宮崎県' }, { value: '鹿児島県', label: '鹿児島県' },
      { value: '沖縄県', label: '沖縄県' }
    ]
  },
  CN: {
    fields: [
      { name: 'province', label: 'Province' },
      { name: 'city', label: 'City' },
      { name: 'district', label: 'District' },
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'postalCode', label: 'Postal Code' }
    ]
  },
  KR: {
    fields: [
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'province', label: 'Province' },
      { name: 'city', label: 'City' },
      { name: 'district', label: 'District' },
      { name: 'dong', label: 'Neighborhood' },
      { name: 'streetAddress', label: 'Street Address' }
    ]
  },
  CA: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'unit', label: 'Unit/Suite/Apt' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' },
      { name: 'postalCode', label: 'Postal Code' }
    ],
    provinces: [
      { value: 'AB', label: 'Alberta' },
      { value: 'BC', label: 'British Columbia' },
      { value: 'MB', label: 'Manitoba' },
      { value: 'NB', label: 'New Brunswick' },
      { value: 'NL', label: 'Newfoundland and Labrador' },
      { value: 'NS', label: 'Nova Scotia' },
      { value: 'NT', label: 'Northwest Territories' },
      { value: 'NU', label: 'Nunavut' },
      { value: 'ON', label: 'Ontario' },
      { value: 'PE', label: 'Prince Edward Island' },
      { value: 'QC', label: 'Quebec' },
      { value: 'SK', label: 'Saskatchewan' },
      { value: 'YT', label: 'Yukon' }
    ]
  },
  DE: {
    fields: [
      { name: 'streetAddress', label: 'Straße' },
      { name: 'houseNumber', label: 'Hausnummer' },
      { name: 'postalCode', label: 'Postleitzahl' },
      { name: 'city', label: 'Stadt' },
      { name: 'state', label: 'Bundesland' }
    ],
    states: [
      { value: 'BW', label: 'Baden-Württemberg' },
      { value: 'BY', label: 'Bayern' },
      { value: 'BE', label: 'Berlin' },
      { value: 'BB', label: 'Brandenburg' },
      { value: 'HB', label: 'Bremen' },
      { value: 'HH', label: 'Hamburg' },
      { value: 'HE', label: 'Hessen' },
      { value: 'MV', label: 'Mecklenburg-Vorpommern' },
      { value: 'NI', label: 'Niedersachsen' },
      { value: 'NW', label: 'Nordrhein-Westfalen' },
      { value: 'RP', label: 'Rheinland-Pfalz' },
      { value: 'SL', label: 'Saarland' },
      { value: 'SN', label: 'Sachsen' },
      { value: 'ST', label: 'Sachsen-Anhalt' },
      { value: 'SH', label: 'Schleswig-Holstein' },
      { value: 'TH', label: 'Thüringen' }
    ]
  },
  FR: {
    fields: [
      { name: 'streetNumber', label: 'Street Number' },
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'Region' }
    ],
    states: [
      { value: 'ARA', label: 'Auvergne-Rhône-Alpes' },
      { value: 'BFC', label: 'Bourgogne-Franche-Comté' },
      { value: 'BRE', label: 'Bretagne' },
      { value: 'CVL', label: 'Centre-Val de Loire' },
      { value: 'COR', label: 'Corse' },
      { value: 'GES', label: 'Grand Est' },
      { value: 'HDF', label: 'Hauts-de-France' },
      { value: 'IDF', label: 'Île-de-France' },
      { value: 'NOR', label: 'Normandie' },
      { value: 'NAQ', label: 'Nouvelle-Aquitaine' },
      { value: 'OCC', label: 'Occitanie' },
      { value: 'PDL', label: 'Pays de la Loire' },
      { value: 'PAC', label: "Provence-Alpes-Côte d'Azur" }
    ]
  },
  IT: {
    fields: [
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' },
      { name: 'region', label: 'Region' }
    ],
    regions: [
      { value: 'ABR', label: 'Abruzzo' },
      { value: 'BAS', label: 'Basilicata' },
      { value: 'CAL', label: 'Calabria' },
      { value: 'CAM', label: 'Campania' },
      { value: 'EMR', label: 'Emilia-Romagna' },
      { value: 'FVG', label: 'Friuli Venezia Giulia' },
      { value: 'LAZ', label: 'Lazio' },
      { value: 'LIG', label: 'Liguria' },
      { value: 'LOM', label: 'Lombardia' },
      { value: 'MAR', label: 'Marche' },
      { value: 'MOL', label: 'Molise' },
      { value: 'PIE', label: 'Piemonte' },
      { value: 'PUG', label: 'Puglia' },
      { value: 'SAR', label: 'Sardegna' },
      { value: 'SIC', label: 'Sicilia' },
      { value: 'TOS', label: 'Toscana' },
      { value: 'TAA', label: 'Trentino-Alto Adige' },
      { value: 'UMB', label: 'Umbria' },
      { value: 'VDA', label: "Valle d'Aosta" },
      { value: 'VEN', label: 'Veneto' }
    ]
  },
  ES: {
    fields: [
      { name: 'streetType', label: 'Street Type' },
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'floor', label: 'Floor' },
      { name: 'door', label: 'Door' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' }
    ],
    provinces: [
      { value: 'A', label: 'Alicante' }, { value: 'AB', label: 'Albacete' },
      { value: 'AL', label: 'Almería' }, { value: 'AV', label: 'Ávila' },
      { value: 'B', label: 'Barcelona' }, { value: 'BA', label: 'Badajoz' },
      { value: 'BI', label: 'Vizcaya' }, { value: 'BU', label: 'Burgos' },
      { value: 'C', label: 'A Coruña' }, { value: 'CA', label: 'Cádiz' },
      { value: 'CC', label: 'Cáceres' }, { value: 'CO', label: 'Córdoba' },
      { value: 'CR', label: 'Ciudad Real' }, { value: 'CS', label: 'Castellón' },
      { value: 'CU', label: 'Cuenca' }, { value: 'GC', label: 'Las Palmas' },
      { value: 'GI', label: 'Girona' }, { value: 'GR', label: 'Granada' },
      { value: 'GU', label: 'Guadalajara' }, { value: 'H', label: 'Huelva' },
      { value: 'HU', label: 'Huesca' }, { value: 'J', label: 'Jaén' },
      { value: 'L', label: 'Lleida' }, { value: 'LE', label: 'León' },
      { value: 'LO', label: 'La Rioja' }, { value: 'LU', label: 'Lugo' },
      { value: 'M', label: 'Madrid' }, { value: 'MA', label: 'Málaga' },
      { value: 'MU', label: 'Murcia' }, { value: 'NA', label: 'Navarra' },
      { value: 'O', label: 'Asturias' }, { value: 'OR', label: 'Ourense' },
      { value: 'P', label: 'Palencia' }, { value: 'PM', label: 'Baleares' },
      { value: 'PO', label: 'Pontevedra' }, { value: 'S', label: 'Cantabria' },
      { value: 'SA', label: 'Salamanca' }, { value: 'SE', label: 'Sevilla' },
      { value: 'SG', label: 'Segovia' }, { value: 'SO', label: 'Soria' },
      { value: 'SS', label: 'Guipúzcoa' }, { value: 'T', label: 'Tarragona' },
      { value: 'TE', label: 'Teruel' }, { value: 'TF', label: 'Santa Cruz de Tenerife' },
      { value: 'TO', label: 'Toledo' }, { value: 'V', label: 'Valencia' },
      { value: 'VA', label: 'Valladolid' }, { value: 'Z', label: 'Zaragoza' },
      { value: 'ZA', label: 'Zamora' }
    ]
  },
  NL: {
    fields: [
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' }
    ],
    provinces: [
      { value: 'DR', label: 'Drenthe' },
      { value: 'FL', label: 'Flevoland' },
      { value: 'FR', label: 'Friesland' },
      { value: 'GE', label: 'Gelderland' },
      { value: 'GR', label: 'Groningen' },
      { value: 'LI', label: 'Limburg' },
      { value: 'NB', label: 'Noord-Brabant' },
      { value: 'NH', label: 'Noord-Holland' },
      { value: 'OV', label: 'Overijssel' },
      { value: 'UT', label: 'Utrecht' },
      { value: 'ZE', label: 'Zeeland' },
      { value: 'ZH', label: 'Zuid-Holland' }
    ]
  },
  BE: {
    fields: [
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' },
      { name: 'region', label: 'Region' }
    ],
    regions: [
      { value: 'BRU', label: 'Brussels-Capital Region' },
      { value: 'VLG', label: 'Flemish Region' },
      { value: 'WAL', label: 'Walloon Region' }
    ]
  },
  SE: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'municipality', label: 'Municipality' },
      { name: 'county', label: 'County' }
    ]
  },
  NO: {
    fields: [
      { name: 'streetAddress', label: 'Street Address' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'municipality', label: 'Municipality' },
      { name: 'county', label: 'County' }
    ]
  },
  DK: {
    fields: [
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'floor', label: 'Floor' },
      { name: 'door', label: 'Door' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' }
    ],
    regions: [
      { value: 'H', label: 'Hovedstaden' },
      { value: 'M', label: 'Midtjylland' },
      { value: 'N', label: 'Nordjylland' },
      { value: 'SJ', label: 'Sjælland' },
      { value: 'SD', label: 'Syddanmark' }
    ]
  },
  PL: {
    fields: [
      { name: 'streetAddress', label: 'Street Name' },
      { name: 'houseNumber', label: 'House Number' },
      { name: 'apartmentNumber', label: 'Apartment Number' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'city', label: 'City' },
      { name: 'voivodeship', label: 'Province' }
    ],
    voivodeships: [
      { value: 'DS', label: 'Dolnośląskie' },
      { value: 'KP', label: 'Kujawsko-pomorskie' },
      { value: 'LU', label: 'Lubelskie' },
      { value: 'LB', label: 'Lubuskie' },
      { value: 'LD', label: 'Łódzkie' },
      { value: 'MA', label: 'Małopolskie' },
      { value: 'MZ', label: 'Mazowieckie' },
      { value: 'OP', label: 'Opolskie' },
      { value: 'PK', label: 'Podkarpackie' },
      { value: 'PD', label: 'Podlaskie' },
      { value: 'PM', label: 'Pomorskie' },
      { value: 'SL', label: 'Śląskie' },
      { value: 'SK', label: 'Świętokrzyskie' },
      { value: 'WN', label: 'Warmińsko-mazurskie' },
      { value: 'WP', label: 'Wielkopolskie' },
      { value: 'ZP', label: 'Zachodniopomorskie' }
    ]
  }
};

// Default address fields for other countries
const defaultFields = [
  { name: 'streetAddress', label: 'Street Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State/Province' },
  { name: 'postalCode', label: 'Postal Code' }
];

const AddressAutocomplete = ({ onAddressSelect, placeholder = "Enter address...", initialValue = "" }) => {
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(true);
  const [value, setValue] = useState(initialValue);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    country: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    // Indonesian specific fields
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    province: '',
    // Australian specific fields
    suburb: ''
  });

  const countries = useMemo(() => countryList().getData(), []);

  // Get the appropriate fields based on the selected country
  const getAddressFields = (countryCode) => {
    if (!countryCode) return defaultFields;
    return (countrySpecificFields[countryCode]?.fields || defaultFields);
  };

  // Update value when initialValue changes
  useEffect(() => {
    if (!isManualMode) {
      setValue(initialValue);
      setSelectedFromDropdown(!!initialValue);
    }
  }, [initialValue, isManualMode]);

  useEffect(() => {
    if (!isManualMode) {
      const checkGoogleMapsLoaded = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          setError(null);
          initAutocomplete();
        } else if (window.gm_authFailure) {
          setError('Google Maps authentication failed. Please check API key configuration.');
        } else {
          setTimeout(checkGoogleMapsLoaded, 100);
        }
      };

      checkGoogleMapsLoaded();
    }
  }, [isManualMode]);

  const initAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'address_components'],
        types: ['address']
      });

      // Remove the old pac-container if it exists
      const oldContainer = document.querySelector('.pac-container');
      if (oldContainer) {
        oldContainer.remove();
      }

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.formatted_address) {
          setSelectedFromDropdown(true);
          setValue(place.formatted_address);
          onAddressSelect(place.formatted_address);
        } else {
          setSelectedFromDropdown(false);
          setError('Please select an address from the dropdown suggestions');
        }
      });

      // Style the dropdown
      const observer = new MutationObserver((mutations) => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          pacContainer.style.zIndex = '10000';
          pacContainer.style.marginTop = '2px';
          pacContainer.style.borderRadius = '0.375rem';
          pacContainer.style.border = '1px solid #e5e7eb';
          pacContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          pacContainer.style.backgroundColor = 'white';
          const items = pacContainer.querySelectorAll('.pac-item');
          items.forEach(item => {
            item.style.color = '#1f2937';
            item.style.padding = '8px 12px';
          });
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setError('Error initializing address autocomplete');
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSelectedFromDropdown(false);
    if (newValue === '') {
      onAddressSelect('');
    }
    setError(null);
  };

  const formatAddressForCountry = (address, countryCode) => {
    switch (countryCode) {
      case 'ID':
        return [
          address.streetAddress,
          address.rt && address.rw ? `RT ${address.rt} RW ${address.rw}` : '',
          address.kelurahan,
          address.kecamatan,
          address.city,
          address.province,
          address.postalCode,
          'Indonesia'
        ].filter(Boolean).join(', ');
      case 'AU':
        return [
          address.streetAddress,
          address.suburb,
          `${address.state} ${address.postalCode}`,
          'Australia'
        ].filter(Boolean).join(', ');
      case 'US':
        return [
          address.streetAddress,
          address.unit,
          address.city,
          `${address.state} ${address.postalCode}`,
          'United States'
        ].filter(Boolean).join(', ');
      case 'GB':
        return [
          address.streetAddress,
          address.locality,
          address.city,
          address.county,
          address.postalCode,
          'United Kingdom'
        ].filter(Boolean).join(', ');
      case 'JP':
        return [
          `〒${address.postalCode}`,
          address.prefecture,
          address.city,
          address.ward,
          address.block,
          address.building,
          'Japan'
        ].filter(Boolean).join(' ');
      case 'CN':
        return [
          address.province,
          address.city,
          address.district,
          address.streetAddress,
          address.postalCode,
          'China'
        ].filter(Boolean).join(' ');
      case 'KR':
        return [
          address.province,
          address.city,
          address.district,
          address.dong,
          address.streetAddress,
          `(${address.postalCode})`,
          'South Korea'
        ].filter(Boolean).join(' ');
      case 'CA':
        return [
          address.streetAddress,
          address.unit,
          address.city,
          `${address.province} ${address.postalCode}`,
          'Canada'
        ].filter(Boolean).join(', ');
      case 'DE':
        return [
          `${address.streetAddress} ${address.houseNumber}`,
          `${address.postalCode} ${address.city}`,
          address.state,
          'Germany'
        ].filter(Boolean).join(', ');
      case 'FR':
        return [
          `${address.streetNumber} ${address.streetAddress}`,
          `${address.postalCode} ${address.city}`,
          address.state,
          'France'
        ].filter(Boolean).join(', ');
      case 'IT':
        return [
          `${address.streetAddress}, ${address.houseNumber}`,
          `${address.postalCode} ${address.city} (${address.province})`,
          address.region,
          'Italy'
        ].filter(Boolean).join(', ');
      case 'ES':
        return [
          `${address.streetType} ${address.streetAddress}, ${address.houseNumber}`,
          address.floor && address.door ? `${address.floor}° ${address.door}` : '',
          `${address.postalCode} ${address.city}`,
          address.province,
          'Spain'
        ].filter(Boolean).join(', ');
      case 'NL':
        return [
          `${address.streetAddress} ${address.houseNumber}`,
          `${address.postalCode} ${address.city}`,
          address.province,
          'Netherlands'
        ].filter(Boolean).join(', ');
      case 'BE':
        return [
          `${address.streetAddress} ${address.houseNumber}`,
          `${address.postalCode} ${address.city}`,
          address.province,
          address.region,
          'Belgium'
        ].filter(Boolean).join(', ');
      case 'SE':
        return [
          address.streetAddress,
          `${address.postalCode} ${address.city}`,
          address.municipality,
          address.county,
          'Sweden'
        ].filter(Boolean).join(', ');
      case 'NO':
        return [
          address.streetAddress,
          `${address.postalCode} ${address.city}`,
          address.municipality,
          address.county,
          'Norway'
        ].filter(Boolean).join(', ');
      case 'DK':
        return [
          `${address.streetAddress} ${address.houseNumber}`,
          address.floor && address.door ? `${address.floor}. ${address.door}` : '',
          `${address.postalCode} ${address.city}`,
          address.region,
          'Denmark'
        ].filter(Boolean).join(', ');
      case 'PL':
        return [
          `ul. ${address.streetAddress} ${address.houseNumber}${address.apartmentNumber ? '/' + address.apartmentNumber : ''}`,
          `${address.postalCode} ${address.city}`,
          address.voivodeship,
          'Poland'
        ].filter(Boolean).join(', ');
      default:
        return [
          address.streetAddress,
          address.city,
          address.state,
          address.postalCode,
          countries.find(c => c.value === address.country)?.label
        ].filter(Boolean).join(', ');
    }
  };

  const handleManualAddressChange = (field, value) => {
    const updatedAddress = { ...manualAddress, [field]: value };
    setManualAddress(updatedAddress);

    // Format address based on country
    const formattedAddress = formatAddressForCountry(updatedAddress, updatedAddress.country);

    // Use Geocoding service to get coordinates
    if (window.google && formattedAddress) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: formattedAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          onAddressSelect(results[0].formatted_address);
        }
      });
    }
  };

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      setValue('');
      setSelectedFromDropdown(true);
    }
  };

  const renderAddressFields = () => {
    const fields = getAddressFields(manualAddress.country);
    
    return (
      <div className="space-y-3">
        {fields.map((field) => {
          // Handle state/province/region dropdowns for countries with predefined lists
          if (field.name === 'state' || field.name === 'province' || field.name === 'prefecture' || 
              field.name === 'region' || field.name === 'voivodeship') {
            const options = {
              US: countrySpecificFields.US.states,
              AU: countrySpecificFields.AU.states,
              CA: countrySpecificFields.CA.provinces,
              DE: countrySpecificFields.DE.states,
              JP: countrySpecificFields.JP.prefectures,
              FR: countrySpecificFields.FR.states,
              IT: countrySpecificFields.IT.regions,
              ES: countrySpecificFields.ES.provinces,
              NL: countrySpecificFields.NL.provinces,
              BE: countrySpecificFields.BE.regions,
              DK: countrySpecificFields.DK.regions,
              PL: countrySpecificFields.PL.voivodeships
            }[manualAddress.country];

            if (options) {
              return (
                <Select
                  key={field.name}
                  options={options}
                  value={options.find(opt => opt.value === manualAddress[field.name])}
                  onChange={(option) => handleManualAddressChange(field.name, option.value)}
                  placeholder={field.label}
                  className="mb-2"
                />
              );
            }
          }
          
          // Special handling for RT/RW fields
          if (field.name === 'rt' || field.name === 'rw') {
            return (
              <div key={field.name} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={manualAddress[field.name]}
                  onChange={(e) => handleManualAddressChange(field.name, e.target.value)}
                  placeholder={field.label}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            );
          }

          // Default input field
          return (
            <input
              key={field.name}
              type="text"
              value={manualAddress[field.name]}
              onChange={(e) => handleManualAddressChange(field.name, e.target.value)}
              placeholder={field.label}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative">
      {!isManualMode ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={isLoaded ? placeholder : "Loading address autocomplete..."}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? 'border-red-500' : ''}`}
            autoComplete="off"
            disabled={!isLoaded}
          />
          {!isLoaded && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <Select
            options={countries}
            value={countries.find(country => country.value === manualAddress.country)}
            onChange={(option) => handleManualAddressChange('country', option.value)}
            placeholder="Select country..."
            className="mb-2"
          />
          {manualAddress.country && renderAddressFields()}
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
      {!selectedFromDropdown && value && !error && !isManualMode && (
        <div className="text-blue-500 text-sm mt-1">Please select an address from the dropdown suggestions</div>
      )}
      <button
        onClick={toggleManualMode}
        className="text-red-500 text-sm mt-1 hover:underline cursor-pointer"
      >
        {isManualMode ? "Use address autocomplete instead" : "Can't find your address? Click here"}
      </button>
    </div>
  );
};

export default AddressAutocomplete; 