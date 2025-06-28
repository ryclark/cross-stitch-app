import React from 'react';

export const DMC_COLORS = [
  { name: 'White', code: 'B5200', hex: '#FFFFFF' },
  { name: 'Snow White', code: 'Blanc', hex: '#F8F8F0' },
  { name: 'Black', code: '310', hex: '#000000' },
  { name: 'Dark Brown', code: '3371', hex: '#3F2D24' },
  { name: 'Red', code: '321', hex: '#C41E3A' },
  { name: 'Dark Red', code: '498', hex: '#8B1B1B' },
  { name: 'Very Light Yellow', code: '3078', hex: '#FFFFC2' },
  { name: 'Yellow', code: '444', hex: '#FFF200' },
  { name: 'Light Orange', code: '3824', hex: '#FFB07C' },
  { name: 'Orange', code: '740', hex: '#FF8000' },
  { name: 'Dark Orange', code: '947', hex: '#FC6C3F' },
  { name: 'Light Peach', code: '948', hex: '#FFE0C0' },
  { name: 'Medium Peach', code: '754', hex: '#FFD2B2' },
  { name: 'Coral', code: '351', hex: '#FE5A50' },
  { name: 'Light Pink', code: '818', hex: '#FFDDEE' },
  { name: 'Pink', code: '604', hex: '#FFB7D5' },
  { name: 'Dark Pink', code: '602', hex: '#E55B92' },
  { name: 'Lavender', code: '554', hex: '#BBA1D6' },
  { name: 'Purple', code: '550', hex: '#68377C' },
  { name: 'Light Purple', code: '553', hex: '#A767A0' },
  { name: 'Sky Blue', code: '3843', hex: '#00BFFF' },
  { name: 'Very Light Blue', code: '775', hex: '#BFDFFF' },
  { name: 'Baby Blue', code: '3325', hex: '#6EC8E5' },
  { name: 'Blue', code: '797', hex: '#003366' },
  { name: 'Royal Blue', code: '796', hex: '#232F65' },
  { name: 'Navy', code: '939', hex: '#252850' },
  { name: 'Light Teal', code: '3846', hex: '#00B2A9' },
  { name: 'Teal', code: '959', hex: '#4FC7B6' },
  { name: 'Pale Aqua', code: '964', hex: '#B9E6DF' },
  { name: 'Green', code: '699', hex: '#006442' },
  { name: 'Light Green', code: '703', hex: '#53B781' },
  { name: 'Emerald Green', code: '910', hex: '#007A3D' },
  { name: 'Lime Green', code: '704', hex: '#C4DF8A' },
  { name: 'Light Olive Green', code: '3348', hex: '#A3C586' },
  { name: 'Olive Green', code: '936', hex: '#455B23' },
  { name: 'Light Brown', code: '437', hex: '#BFA178' },
  { name: 'Brown', code: '801', hex: '#643A14' },
  { name: 'Light Tan', code: '3770', hex: '#FBE8D3' },
  { name: 'Tan', code: '436', hex: '#CDA36A' },
  { name: 'Very Light Gray', code: '762', hex: '#D9D9D9' },
  { name: 'Light Gray', code: '415', hex: '#B4B4B4' },
  { name: 'Gray', code: '318', hex: '#A0A0A0' },
  { name: 'Dark Gray', code: '317', hex: '#666666' },
  { name: 'Ecru', code: 'Ecru', hex: '#F9F6ED' },
  { name: 'Mustard', code: '3822', hex: '#F2D471' },
  { name: 'Light Gold', code: '728', hex: '#FFD37F' },
  { name: 'Dark Gold', code: '782', hex: '#BB8E36' },
  { name: 'Light Beige', code: '3866', hex: '#E1D3C0' },
  { name: 'Pale Peach', code: '3771', hex: '#FFD1BB' },
  { name: 'Rose', code: '335', hex: '#D04B72' }
  // You can add even more for maximum richness!
];

export default function ColorPalette({ selected, setSelected }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '10px 0', justifyContent: 'center' }}>
      {DMC_COLORS.map(c => (
        <div key={c.code} style={{ textAlign: 'center', fontSize: 11 }}>
          <div
            onClick={() => setSelected(c.hex)}
            style={{
              width: 24,
              height: 24,
              border: selected === c.hex ? '2px solid #333' : '1px solid #ccc',
              background: c.hex,
              borderRadius: 4,
              cursor: 'pointer',
              margin: '0 auto'
            }}
            title={`${c.name} (${c.code})`}
          />
          <div style={{ marginTop: 1 }}>{c.code}</div>
        </div>
      ))}
    </div>
  );
}
