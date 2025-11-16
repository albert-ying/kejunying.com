function Block(el)
  if el.t == "Para" or el.t == "Plain" then
      for k, _ in ipairs(el.content) do

          if el.content[k].t == "Str" and el.content[k].text == "Ying," and
             el.content[k + 1].t == "Space" and
             el.content[k + 2].t == "Str" and el.content[k + 2].text:find("^K.") then

              -- Combine "Nitta, J. H." into a single Strong element
              el.content[k] = pandoc.Strong({
                  pandoc.Str("Ying,"),
                  pandoc.Space(),
                  pandoc.Str("K.")
              })

              -- Remove the next 4 elements
              for i = 1, 2 do
                  table.remove(el.content, k + 1)
              end

              break -- break the loop as the indices have changed
          end

          if el.content[k].t == "Str" and el.content[k].text == "Ying," and
             el.content[k + 1].t == "Space" and
             el.content[k + 2].t == "Str" and el.content[k + 2].text:find("^A.") and
             el.content[k + 3].t == "Space" and
             el.content[k + 4].t == "Str" and el.content[k + 4].text:find("^K.") then

              -- Combine "Nitta, J. H." into a single Strong element
              el.content[k] = pandoc.Strong({
                  pandoc.Str("Ying,"),
                  pandoc.Space(),
                  pandoc.Str("A."),
                  pandoc.Space(),
                  pandoc.Str("K.")
              })

              -- Remove the next 4 elements
              for i = 1, 4 do
                  table.remove(el.content, k + 1)
              end

              break -- break the loop as the indices have changed
          end

      end
  end
  return el
end
