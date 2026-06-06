package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.response.BairroResponse;
import br.com.olhodobairro.repository.BairroRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class BairroService {

    private static final Map<String, Integer> ORDEM_BAIRROS_LINS = Map.ofEntries(
            Map.entry("Centro", 1),
            Map.entry("Junqueira", 2),
            Map.entry("Vila Clélia", 3),
            Map.entry("Jardim Tangará", 4),
            Map.entry("Jardim Santa Clara", 5),
            Map.entry("Parque Aeroporto", 6),
            Map.entry("Jardim Aeroporto", 7),
            Map.entry("Ribeiro", 8),
            Map.entry("Residencial Morumbi", 9),
            Map.entry("Residencial San Fernando", 10)
    );

    private final BairroRepository bairroRepository;

    public BairroService(BairroRepository bairroRepository) {
        this.bairroRepository = bairroRepository;
    }

    public List<BairroResponse> listarPorCidade(String cidade, String estado) {
        return bairroRepository.findByCidadeAndEstado(cidade, estado).stream()
                .sorted(Comparator
                        .comparing((br.com.olhodobairro.model.Bairro bairro) -> ORDEM_BAIRROS_LINS.getOrDefault(bairro.getNome(), Integer.MAX_VALUE))
                        .thenComparing(bairro -> bairro.getNome().toLowerCase()))
                .map(bairro -> new BairroResponse(
                        bairro.getId(),
                        bairro.getNome(),
                        bairro.getCidade(),
                        bairro.getEstado(),
                        bairro.getLatitude(),
                        bairro.getLongitude()
                ))
                .toList();
    }
}
