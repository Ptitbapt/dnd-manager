// components/shops/ShopItemsTable.jsx
"use client";

export default function ShopItemsTable({ shopItems }) {
  if (!shopItems || shopItems.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="medieval-table w-full">
        <thead className="bg-amber-50">
          <tr>
            <th className="py-3">Nom</th>
            <th className="py-3">Type</th>
            <th className="py-3">Rareté</th>
            <th className="py-3">Valeur (PO)</th>
            <th className="py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {shopItems.map((item, index) => (
            <tr
              key={item.IDX}
              className={index % 2 === 0 ? "bg-white" : "bg-amber-50"}
            >
              <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900">
                {item.Nomobjet}
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2 bg-amber-500"></span>
                  {item.Type} {item.Soustype ? `(${item.Soustype})` : ""}
                </div>
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <span
                  className={`rarity-badge rarity-${item.Rarete.toLowerCase().replace(
                    " ",
                    "-"
                  )}`}
                >
                  {item.Rarete}
                </span>
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                {item.Valeur ? `${item.Valeur} PO` : "-"}
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {item.Source}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
